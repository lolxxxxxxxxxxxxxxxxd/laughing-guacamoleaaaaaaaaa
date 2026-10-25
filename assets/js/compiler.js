"use strict";

(() => {
  const data = window.OFFSET_EDITOR_DATA;
  const lessons = window.OFFSET_LESSONS || [];
  const editor = document.getElementById("code-editor");
  const language = document.getElementById("language-select");
  const standard = document.getElementById("standard-select");
  const example = document.getElementById("example-select");
  const stdin = document.getElementById("stdin-input");
  const args = document.getElementById("program-arguments");
  const output = document.getElementById("compiler-output");
  const status = document.getElementById("compiler-status");
  const runButton = document.getElementById("run-code");
  const dialog = document.getElementById("workspace-dialog");
  if (!data || !editor || !runButton || !dialog) return;

  const workspaceKey = "offset.workspace.v1";
  const maxProjectBytes = 180000;
  const codeExtensions = /\.(?:c|cc|cpp|cxx|h|hh|hpp|hxx)$/i;
  const sourceExtensions = /\.(?:c|cc|cpp|cxx)$/i;
  const collapsedFolders = new Set();
  let saveTimer = 0;
  let activeRequest = null;
  let currentFolder = "";
  let workspaceReady = false;
  let workspace = loadWorkspace();

  const projectSelect = document.getElementById("project-select");
  const tree = document.getElementById("workspace-tree");
  const tabs = document.getElementById("editor-tabs");
  const form = document.getElementById("workspace-form");
  const nameInput = document.getElementById("workspace-name");
  const errorNode = document.getElementById("workspace-dialog-error");

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function makeId() {
    return `project-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function mainFilename(lang) {
    return lang === "c" ? "main.c" : "main.cpp";
  }

  function legacySource(lang) {
    try {
      return localStorage.getItem(data.storageKeys[lang]) ?? data.examples[lang].hello;
    } catch {
      return data.examples[lang].hello;
    }
  }

  function makeProject(name, lang, template = "hello", sourceOverride = null) {
    const languageId = lang === "c" ? "c" : "cpp";
    const files = {};
    const main = mainFilename(languageId);
    if (template === "multi" && languageId === "cpp") {
      files["main.cpp"] = "#include <iostream>\n#include <string>\n#include \"greeting.hpp\"\n\nint main() {\n    std::cout << make_greeting(\"OFFSET\") << '\\n';\n}\n";
      files["greeting.hpp"] = "#pragma once\n#include <string>\n\nstd::string make_greeting(const std::string& name);\n";
      files["greeting.cpp"] = "#include \"greeting.hpp\"\n\nstd::string make_greeting(const std::string& name) {\n    return \"Hello, \" + name + \"!\";\n}\n";
    } else if (template === "empty") {
      files[main] = languageId === "c"
        ? "#include <stdio.h>\n\nint main(void) {\n    return 0;\n}\n"
        : "#include <iostream>\n\nint main() {\n    return 0;\n}\n";
    } else {
      files[main] = sourceOverride || legacySource(languageId);
    }

    return {
      id: makeId(),
      name: String(name || (languageId === "c" ? "C scratch" : "C++ scratch")).trim().slice(0, 64),
      language: languageId,
      standard: data.standards[languageId][0][0],
      files,
      folders: [],
      openFiles: [main],
      activeFile: main,
      stdin: template === "hello" && !sourceOverride ? "" : "",
      args: ""
    };
  }

  function normalizePath(value) {
    const parts = String(value || "").trim().replace(/\\/g, "/").split("/").filter(Boolean);
    if (!parts.length || parts.some((part) => part === "." || part === ".." || !/^[\w .-]+$/.test(part))) return "";
    return parts.join("/");
  }

  function normalizeProject(raw) {
    if (!raw || typeof raw !== "object" || !raw.files || typeof raw.files !== "object") return null;
    const lang = raw.language === "c" ? "c" : "cpp";
    const files = {};
    for (const [path, contents] of Object.entries(raw.files)) {
      const safePath = normalizePath(path);
      if (!safePath || typeof contents !== "string" || !codeExtensions.test(safePath)) continue;
      files[safePath] = contents.slice(0, maxProjectBytes);
    }
    if (!Object.keys(files).length) return null;
    const folders = Array.isArray(raw.folders) ? raw.folders.map(normalizePath).filter(Boolean) : [];
    const filePaths = Object.keys(files);
    const openFiles = Array.isArray(raw.openFiles)
      ? raw.openFiles.map(normalizePath).filter((path) => filePaths.includes(path))
      : [];
    const activeFile = filePaths.includes(raw.activeFile) ? raw.activeFile : filePaths[0];
    if (!openFiles.includes(activeFile)) openFiles.push(activeFile);
    const knownStandards = data.standards[lang].map(([value]) => value);
    return {
      id: typeof raw.id === "string" ? raw.id : makeId(),
      name: String(raw.name || "Imported project").trim().slice(0, 64),
      language: lang,
      standard: knownStandards.includes(raw.standard) ? raw.standard : data.standards[lang][0][0],
      files,
      folders: [...new Set(folders)],
      openFiles,
      activeFile,
      stdin: typeof raw.stdin === "string" ? raw.stdin.slice(0, 10000) : "",
      args: typeof raw.args === "string" ? raw.args.slice(0, 1000) : ""
    };
  }

  function loadWorkspace() {
    try {
      const saved = JSON.parse(localStorage.getItem(workspaceKey) || "null");
      if (saved && Array.isArray(saved.projects)) {
        const projects = saved.projects.map(normalizeProject).filter(Boolean);
        if (projects.length) {
          const activeProjectId = projects.some((project) => project.id === saved.activeProjectId)
            ? saved.activeProjectId
            : projects[0].id;
          return { projects, activeProjectId };
        }
      }
    } catch {
      // Start with a clean workspace if saved data is unavailable or invalid.
    }
    const project = makeProject("C++ scratch", "cpp", "hello", legacySource("cpp"));
    return { projects: [project], activeProjectId: project.id };
  }

  function activeProject() {
    return workspace.projects.find((project) => project.id === workspace.activeProjectId) || workspace.projects[0];
  }

  function setWorkspaceState(message, state = "saved") {
    const node = document.getElementById("workspace-save-state");
    node.textContent = message;
    node.dataset.state = state;
  }

  function setStatus(message, state = "idle") {
    status.textContent = message;
    status.dataset.state = state;
  }

  function persistWorkspace() {
    window.clearTimeout(saveTimer);
    try {
      localStorage.setItem(workspaceKey, JSON.stringify(workspace));
      setWorkspaceState("Saved locally", "saved");
    } catch {
      setWorkspaceState("Storage full — export this project", "error");
    }
  }

  function scheduleSave() {
    setWorkspaceState("Saving…", "saving");
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(persistWorkspace, 250);
  }

  function saveActiveFile(source = editor.value) {
    const project = activeProject();
    if (!project || !Object.hasOwn(project.files, project.activeFile)) return;
    project.files[project.activeFile] = source;
    scheduleSave();
  }

  function fileBase(path) {
    return path.split("/").pop();
  }

  function addParents(project, path) {
    const parts = path.split("/");
    let parent = "";
    for (const part of parts.slice(0, -1)) {
      parent = parent ? `${parent}/${part}` : part;
      if (!project.folders.includes(parent)) project.folders.push(parent);
    }
  }

  function populateStandards(project) {
    const options = data.standards[project.language];
    standard.replaceChildren(...options.map(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      return option;
    }));
    standard.value = options.some(([value]) => value === project.standard) ? project.standard : options[0][0];
    project.standard = standard.value;
  }

  function populateExamples(lang) {
    example.replaceChildren();
    const custom = document.createElement("option");
    custom.value = "custom";
    custom.textContent = "Current file";
    example.append(custom);
    for (const id of Object.keys(data.examples[lang])) {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = data.exampleLabels[id] || id;
      example.append(option);
    }
  }

  function sourceFile(project) {
    const files = Object.keys(project.files);
    const expected = project.language === "c" ? /(^|\/)main\.c$/i : /(^|\/)main\.(?:cpp|cc|cxx)$/i;
    return files.find((path) => expected.test(path)) || files.find((path) => sourceExtensions.test(path)) || "";
  }

  function filenameLabel(path) {
    const project = activeProject();
    const langLabel = project.language === "c" ? "C17" : "C++20";
    const editorFilename = document.getElementById("editor-filename");
    if (editorFilename) editorFilename.textContent = fileBase(path);
    document.getElementById("compiler-file-label").textContent = `${path} · GCC 15.2`;
    document.getElementById("compiler-project-title").textContent = project.name;
    document.getElementById("explorer-project-name").textContent = project.name.toUpperCase();
    document.getElementById("terminal-language").textContent = project.language === "c" ? "C" : "C++";
    document.getElementById("line-count").dataset.language = langLabel;
  }

  function treeFrom(project) {
    const root = { folders: new Map(), files: [] };
    function ensureFolder(path) {
      let node = root;
      let prefix = "";
      for (const segment of path.split("/")) {
        prefix = prefix ? `${prefix}/${segment}` : segment;
        if (!node.folders.has(segment)) node.folders.set(segment, { path: prefix, folders: new Map(), files: [] });
        node = node.folders.get(segment);
      }
      return node;
    }
    for (const folder of project.folders) ensureFolder(folder);
    for (const path of Object.keys(project.files)) {
      const segments = path.split("/");
      const name = segments.pop();
      const parent = segments.length ? ensureFolder(segments.join("/")) : root;
      parent.files.push({ path, name });
    }
    return root;
  }

  function renderFileTree() {
    const project = activeProject();
    const root = treeFrom(project);

    function renderChildren(node, depth = 0) {
      const elements = [];
      const folders = [...node.folders.values()].sort((a, b) => a.path.localeCompare(b.path));
      for (const folder of folders) {
        const branch = document.createElement("div");
        branch.className = "file-tree-branch";
        const row = document.createElement("div");
        row.className = "file-tree-row folder-row";
        row.style.setProperty("--depth", String(depth));
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "tree-item tree-folder";
        toggle.dataset.folder = folder.path;
        toggle.setAttribute("role", "treeitem");
        const collapsed = collapsedFolders.has(folder.path);
        toggle.setAttribute("aria-expanded", String(!collapsed));
        toggle.innerHTML = `<span class="tree-caret" aria-hidden="true">${collapsed ? "▸" : "▾"}</span><span class="tree-icon tree-folder-icon" aria-hidden="true">▰</span><span>${escapeHtml(fileBase(folder.path))}</span>`;
        row.append(toggle, actionButton("rename-folder", folder.path, "Rename folder", "R"), actionButton("delete-folder", folder.path, "Delete folder", "×"));
        branch.append(row);
        if (!collapsed) {
          const group = document.createElement("div");
          group.className = "tree-children";
          group.setAttribute("role", "group");
          group.append(...renderChildren(folder, depth + 1));
          branch.append(group);
        }
        elements.push(branch);
      }

      for (const file of node.files.sort((a, b) => a.name.localeCompare(b.name))) {
        const row = document.createElement("div");
        row.className = "file-tree-row file-row";
        row.style.setProperty("--depth", String(depth));
        const open = document.createElement("button");
        open.type = "button";
        open.className = "tree-item tree-file";
        open.dataset.file = file.path;
        open.setAttribute("role", "treeitem");
        open.setAttribute("aria-selected", String(file.path === project.activeFile));
        open.innerHTML = `<span class="tree-caret" aria-hidden="true"></span><span class="tree-icon ${/\.h(?:pp|xx)?$/i.test(file.name) ? "tree-header-icon" : "tree-code-icon"}" aria-hidden="true">${/\.h(?:pp|xx)?$/i.test(file.name) ? "H" : "C"}</span><span class="tree-file-name">${escapeHtml(file.name)}</span>`;
        row.append(open, actionButton("rename-file", file.path, "Rename file", "R"), actionButton("delete-file", file.path, "Delete file", "×"));
        elements.push(row);
      }
      return elements;
    }

    function actionButton(action, path, label, text) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tree-row-action";
      button.dataset.action = action;
      button.dataset.path = path;
      button.setAttribute("aria-label", `${label}: ${path}`);
      button.title = label;
      button.textContent = text;
      return button;
    }

    tree.replaceChildren(...renderChildren(root));
  }

  function renderTabs() {
    const project = activeProject();
    const paths = project.openFiles.filter((path) => Object.hasOwn(project.files, path));
    if (!paths.includes(project.activeFile)) paths.push(project.activeFile);
    project.openFiles = paths;
    tabs.replaceChildren(...paths.map((path) => {
      const shell = document.createElement("div");
      shell.className = `editor-tab-shell${path === project.activeFile ? " is-active" : ""}`;
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "editor-tab-button";
      tab.dataset.tabPath = path;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(path === project.activeFile));
      tab.innerHTML = `<span class="editor-tab-dot" aria-hidden="true"></span><span>${escapeHtml(fileBase(path))}</span>`;
      const close = document.createElement("button");
      close.type = "button";
      close.className = "editor-tab-close";
      close.dataset.closeTab = path;
      close.setAttribute("aria-label", `Close ${path}`);
      close.textContent = "×";
      shell.append(tab, close);
      return shell;
    }));
  }

  function updateExampleSelection() {
    const project = activeProject();
    const source = project.files[project.activeFile];
    const match = Object.entries(data.examples[project.language]).find(([, value]) => value === source);
    example.value = match ? match[0] : "custom";
  }

  function openFile(path, saveCurrent = true) {
    const project = activeProject();
    if (!Object.hasOwn(project.files, path)) return;
    if (saveCurrent && project.activeFile && editor.value !== project.files[project.activeFile]) saveActiveFile();
    project.activeFile = path;
    if (!project.openFiles.includes(path)) project.openFiles.push(path);
    editor.value = project.files[path];
    filenameLabel(path);
    renderTabs();
    renderFileTree();
    updateExampleSelection();
    window.OFFSET_EDITOR?.refresh();
    scheduleSave();
  }

  function renderProjectSelect() {
    projectSelect.replaceChildren(...workspace.projects.map((project) => {
      const option = document.createElement("option");
      option.value = project.id;
      option.textContent = project.name;
      return option;
    }));
    projectSelect.value = workspace.activeProjectId;
  }

  function activateProject(id, saveCurrent = true) {
    if (saveCurrent && workspaceReady) saveActiveFile();
    if (!workspace.projects.some((project) => project.id === id)) return;
    workspace.activeProjectId = id;
    const project = activeProject();
    language.value = project.language;
    populateStandards(project);
    populateExamples(project.language);
    const main = sourceFile(project);
    if (!Object.hasOwn(project.files, project.activeFile)) project.activeFile = main || Object.keys(project.files)[0];
    if (!project.openFiles.includes(project.activeFile)) project.openFiles.push(project.activeFile);
    stdin.value = project.stdin || "";
    args.value = project.args || "";
    renderProjectSelect();
    renderFileTree();
    openFile(project.activeFile, false);
    filenameLabel(project.activeFile);
    document.getElementById("compiler-project-title").textContent = project.name;
    document.getElementById("explorer-project-name").textContent = project.name.toUpperCase();
    document.getElementById("terminal-language").textContent = project.language === "c" ? "C" : "C++";
    persistWorkspace();
    workspaceReady = true;
  }

  function switchLanguage(nextLanguage) {
    saveActiveFile();
    const project = activeProject();
    project.language = nextLanguage === "c" ? "c" : "cpp";
    populateStandards(project);
    populateExamples(project.language);
    const main = mainFilename(project.language);
    if (!Object.hasOwn(project.files, main)) project.files[main] = legacySource(project.language);
    if (!project.openFiles.includes(main)) project.openFiles.push(main);
    project.activeFile = main;
    stdin.value = "";
    project.stdin = "";
    args.value = "";
    project.args = "";
    document.getElementById("terminal-language").textContent = project.language === "c" ? "C" : "C++";
    renderFileTree();
    openFile(main, false);
    updateExampleSelection();
    persistWorkspace();
  }

  function openDialog(action, target = "") {
    dialog.dataset.action = action;
    dialog.dataset.target = target;
    errorNode.hidden = true;
    errorNode.textContent = "";
    const title = document.getElementById("workspace-dialog-title");
    const label = document.getElementById("workspace-name-label");
    const languageField = document.getElementById("workspace-language-field");
    const templateField = document.getElementById("workspace-template-field");
    const submit = document.getElementById("workspace-submit");
    const project = activeProject();
    const options = {
      project: ["Create project", "Project name", "Create project", project.language === "c" ? "C scratch" : "C++ scratch"],
      file: ["Create file", "File path", "Create file", currentFolder ? `${currentFolder}/new_file.${project.language === "c" ? "c" : "cpp"}` : `new_file.${project.language === "c" ? "c" : "cpp"}`],
      folder: ["Create folder", "Folder path", "Create folder", currentFolder ? `${currentFolder}/new_folder` : "new_folder"],
      renameFile: ["Rename file", "New file path", "Save name", target],
      renameFolder: ["Rename folder", "New folder path", "Save name", target]
    }[action];
    if (!options) return;
    title.textContent = options[0];
    label.textContent = options[1];
    submit.textContent = options[2];
    nameInput.value = options[3];
    languageField.hidden = action !== "project";
    templateField.hidden = action !== "project";
    document.getElementById("workspace-language").value = project.language;
    const template = document.getElementById("workspace-template");
    template.value = "hello";
    template.querySelector('option[value="multi"]').disabled = project.language !== "cpp";
    dialog.showModal();
    requestAnimationFrame(() => nameInput.select());
  }

  function showDialogError(message) {
    errorNode.textContent = message;
    errorNode.hidden = false;
    nameInput.focus();
  }

  function uniqueProjectName(name) {
    const used = new Set(workspace.projects.map((project) => project.name.toLowerCase()));
    if (!used.has(name.toLowerCase())) return name;
    let count = 2;
    while (used.has(`${name} ${count}`.toLowerCase())) count += 1;
    return `${name} ${count}`;
  }

  function createProjectFromDialog(name) {
    saveActiveFile();
    const lang = document.getElementById("workspace-language").value;
    const template = document.getElementById("workspace-template").value;
    const project = makeProject(uniqueProjectName(name), lang, template);
    workspace.projects.push(project);
    workspace.activeProjectId = project.id;
    collapsedFolders.clear();
    currentFolder = "";
    activateProject(project.id, false);
    return true;
  }

  function addFilePath(name) {
    const project = activeProject();
    let path = normalizePath(name);
    if (!path) return "Use a file name with letters, numbers, spaces, dots, dashes, or underscores.";
    if (!/\.[a-z0-9]+$/i.test(path)) path += project.language === "c" ? ".c" : ".cpp";
    if (!codeExtensions.test(path)) return "This workbench accepts C/C++ source and header files.";
    if (Object.hasOwn(project.files, path)) return "A file already exists at that path.";
    saveActiveFile();
    project.files[path] = "";
    addParents(project, path);
    project.activeFile = path;
    if (!project.openFiles.includes(path)) project.openFiles.push(path);
    renderFileTree();
    openFile(path, false);
    persistWorkspace();
    return "";
  }

  function addFolderPath(name) {
    const project = activeProject();
    const path = normalizePath(name);
    if (!path) return "Use a folder name with letters, numbers, spaces, dashes, or underscores.";
    if (project.folders.includes(path) || Object.hasOwn(project.files, path)) return "That folder or file already exists.";
    addParents(project, `${path}/placeholder.cpp`);
    if (!project.folders.includes(path)) project.folders.push(path);
    renderFileTree();
    persistWorkspace();
    return "";
  }

  function renameFile(oldPath, newName) {
    const project = activeProject();
    saveActiveFile();
    const newPath = normalizePath(newName);
    if (!newPath || !codeExtensions.test(newPath)) return "Use a valid C/C++ source or header file path.";
    if (newPath !== oldPath && (Object.hasOwn(project.files, newPath) || project.folders.includes(newPath))) return "That path is already in use.";
    project.files[newPath] = project.files[oldPath];
    delete project.files[oldPath];
    addParents(project, newPath);
    project.openFiles = project.openFiles.map((path) => path === oldPath ? newPath : path);
    if (project.activeFile === oldPath) project.activeFile = newPath;
    renderFileTree();
    openFile(project.activeFile, false);
    persistWorkspace();
    return "";
  }

  function renameFolder(oldPath, newName) {
    const project = activeProject();
    saveActiveFile();
    const newPath = normalizePath(newName);
    if (!newPath || newPath === oldPath || newPath.startsWith(`${oldPath}/`)) return "Choose a different folder path.";
    const conflictingFile = Object.hasOwn(project.files, newPath);
    const conflictingFolder = project.folders.some((path) => path === newPath || path.startsWith(`${newPath}/`))
      || Object.keys(project.files).some((path) => path.startsWith(`${newPath}/`));
    if (conflictingFile || conflictingFolder) return "That folder path is already in use.";
    for (const path of Object.keys(project.files)) {
      if (path === oldPath || path.startsWith(`${oldPath}/`)) {
        const renamed = `${newPath}${path.slice(oldPath.length)}`;
        project.files[renamed] = project.files[path];
        delete project.files[path];
      }
    }
    project.folders = [...new Set(project.folders.map((path) => path === oldPath || path.startsWith(`${oldPath}/`) ? `${newPath}${path.slice(oldPath.length)}` : path))];
    project.openFiles = project.openFiles.map((path) => path === oldPath || path.startsWith(`${oldPath}/`) ? `${newPath}${path.slice(oldPath.length)}` : path);
    if (project.activeFile === oldPath || project.activeFile.startsWith(`${oldPath}/`)) project.activeFile = `${newPath}${project.activeFile.slice(oldPath.length)}`;
    renderFileTree();
    openFile(project.activeFile, false);
    persistWorkspace();
    return "";
  }

  function deleteFile(path) {
    const project = activeProject();
    if (Object.keys(project.files).length === 1) {
      window.alert("A project needs at least one source file. Create another file before deleting this one.");
      return;
    }
    if (!window.confirm(`Delete ${path}? This only removes it from this browser workspace.`)) return;
    saveActiveFile();
    delete project.files[path];
    project.openFiles = project.openFiles.filter((openPath) => openPath !== path);
    if (project.activeFile === path) project.activeFile = project.openFiles.at(-1) || Object.keys(project.files)[0];
    openFile(project.activeFile, false);
    renderFileTree();
    persistWorkspace();
  }

  function deleteFolder(path) {
    const project = activeProject();
    const files = Object.keys(project.files).filter((filePath) => filePath.startsWith(`${path}/`));
    if (!window.confirm(`Delete folder ${path} and its ${files.length} file(s)?`)) return;
    saveActiveFile();
    for (const filePath of files) delete project.files[filePath];
    project.folders = project.folders.filter((folder) => folder !== path && !folder.startsWith(`${path}/`));
    project.openFiles = project.openFiles.filter((openPath) => !openPath.startsWith(`${path}/`));
    if (!Object.keys(project.files).length) {
      const main = mainFilename(project.language);
      project.files[main] = data.examples[project.language].hello;
      project.activeFile = main;
      project.openFiles = [main];
    } else if (!Object.hasOwn(project.files, project.activeFile)) {
      project.activeFile = project.openFiles.at(-1) || Object.keys(project.files)[0];
    }
    collapsedFolders.delete(path);
    openFile(project.activeFile, false);
    renderFileTree();
    persistWorkspace();
  }

  function closeTab(path) {
    const project = activeProject();
    if (project.openFiles.length <= 1) return;
    project.openFiles = project.openFiles.filter((item) => item !== path);
    if (project.activeFile === path) {
      project.activeFile = project.openFiles.at(-1);
      openFile(project.activeFile, false);
    } else {
      renderTabs();
      scheduleSave();
    }
  }

  async function runProgram() {
    if (activeRequest) return;
    saveActiveFile();
    const project = activeProject();
    const entry = sourceFile(project);
    if (!entry) {
      output.textContent = "Add a .c, .cc, .cpp, or .cxx file before building.";
      setStatus("No C/C++ source file found.", "error");
      return;
    }
    const isSourceForLanguage = (path) => project.language === "c"
      ? /\.c$/i.test(path)
      : /\.(?:cc|cpp|cxx)$/i.test(path);
    const compileFiles = Object.entries(project.files).filter(([path]) =>
      /\.(?:h|hh|hpp|hxx)$/i.test(path) || isSourceForLanguage(path));
    const files = compileFiles.filter(([path]) => path !== entry);
    const sourceFiles = compileFiles.map(([path]) => path).filter(isSourceForLanguage);
    const useCmake = sourceFiles.length > 1;
    const source = project.files[entry];
    const totalCharacters = source.length + files.reduce((size, [, contents]) => size + contents.length, 0);
    if (!source.trim()) {
      output.textContent = `The entry file ${entry} is empty. Add a main function, then run again.`;
      setStatus("Entry file is empty.", "error");
      openFile(entry);
      editor.focus();
      return;
    }
    if (totalCharacters > 30000) {
      output.textContent = "This browser workbench is for compact examples. Keep the combined C/C++ source under 30,000 characters.";
      setStatus("Project is too large for this workbench.", "error");
      return;
    }

    project.stdin = stdin.value;
    project.args = args.value;
    persistWorkspace();
    const controller = new AbortController();
    activeRequest = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 35000);
    runButton.disabled = true;
    runButton.setAttribute("aria-busy", "true");
    document.getElementById("terminal-run-state").textContent = "Compiling…";
    output.textContent = `Building ${project.files[entry] ? `${project.name} · ${entry}` : project.name}…`;
    setStatus("Compiling all project source files…", "loading");

    const compilerOptions = useCmake
      ? { executorRequest: true, customOutputFilename: "offset-program" }
      : { executorRequest: true };
    const request = {
      source: useCmake ? makeCmakeProject(project, sourceFiles) : source,
      files: useCmake
        ? compileFiles.map(([filename, contents]) => ({ filename, contents }))
        : files.map(([filename, contents]) => ({ filename, contents })),
      lang: project.language === "c" ? "c" : "c++",
      allowStoreCodeDebug: false,
      options: {
        userArguments: `${project.standard || standard.value} -Wall -Wextra`,
        compilerOptions,
        filters: { execute: true },
        executeParameters: { stdin: project.stdin, args: parseArguments(project.args) },
        tools: [],
        libraries: []
      }
    };

    try {
      const endpoint = useCmake ? "cmake" : "compile";
      const compilerId = project.language === "c" ? "cg152" : "g152";
      const response = await fetch(`https://godbolt.org/api/compiler/${compilerId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(request),
        referrerPolicy: "no-referrer",
        cache: "no-store",
        signal: controller.signal
      });
      const body = await response.text();
      let result;
      try {
        result = JSON.parse(body);
      } catch {
        result = null;
      }
      if (!response.ok) {
        output.textContent = body.trim() || "The compiler returned no details.";
        setStatus(`Compiler service returned HTTP ${response.status}. Try again in a moment.`, "error");
        document.getElementById("terminal-run-state").textContent = "Build failed";
      } else if (!result) {
        output.textContent = body.trim() || "The compiler returned an unrecognized response.";
        setStatus("The compiler response could not be read.", "error");
        document.getElementById("terminal-run-state").textContent = "Build failed";
      } else {
        const formatted = formatCompilerResult(result, useCmake);
        output.textContent = formatted.text;
        const failed = formatted.failed;
        setStatus(failed ? "The compiler or program reported an error. Read the output above." : "Finished. Edit a file and run it again.", failed ? "error" : "success");
        document.getElementById("terminal-run-state").textContent = failed ? "Build failed" : "Process exited";
      }
    } catch (error) {
      if (error.name === "AbortError") {
        output.textContent = "The request timed out. Try a smaller project and run it again.";
        setStatus("Request timed out.", "error");
      } else {
        output.textContent = "Could not reach Compiler Explorer. Check your connection or open godbolt.org directly.";
        setStatus("Compiler service unavailable.", "error");
      }
      document.getElementById("terminal-run-state").textContent = "No connection";
    } finally {
      window.clearTimeout(timeoutId);
      runButton.disabled = false;
      runButton.removeAttribute("aria-busy");
      activeRequest = null;
    }
  }

  function makeCmakeProject(project, sourceFiles) {
    const languages = new Set(sourceFiles.some((path) => /\.c$/i.test(path)) ? ["C"] : []);
    if (sourceFiles.some((path) => /\.(?:cc|cpp|cxx)$/i.test(path))) languages.add("CXX");
    const sourceList = sourceFiles.map((path) => `    "${path}"`).join("\n");
    const includeDirectories = new Set([""]);
    for (const path of Object.keys(project.files)) {
      if (!/\.(?:h|hh|hpp|hxx)$/i.test(path)) continue;
      const slash = path.lastIndexOf("/");
      if (slash >= 0) includeDirectories.add(path.slice(0, slash));
    }
    const includes = [...includeDirectories].map((path) => {
      const root = "${CMAKE_CURRENT_SOURCE_DIR}";
      return `    "${path ? `${root}/${path}` : root}"`;
    }).join("\n");
    const cStandard = project.standard.includes("c23") ? 23 : 17;
    const cppStandard = project.standard.includes("23") ? 23 : 20;
    return [
      "cmake_minimum_required(VERSION 3.10)",
      `project(OffsetWorkspace LANGUAGES ${[...languages].join(" ") || "CXX"})`,
      `set(CMAKE_C_STANDARD ${cStandard})`,
      `set(CMAKE_CXX_STANDARD ${cppStandard})`,
      "add_executable(offset-program",
      sourceList,
      ")",
      "target_include_directories(offset-program PRIVATE",
      includes,
      ")",
      ""
    ].join("\n");
  }

  function compilerMessages(messages) {
    if (!Array.isArray(messages)) return [];
    return messages.map((message) => typeof message === "string" ? message : message?.text || "").filter(Boolean);
  }

  function formatCompilerResult(result, useCmake) {
    const lines = [];
    let failed = false;
    if (useCmake) {
      const failedSteps = (result.buildsteps || []).filter((step) => step.code !== 0);
      failed ||= failedSteps.length > 0 || (result.result && result.result.code !== 0);
      const diagnostics = [
        ...failedSteps.flatMap((step) => [...compilerMessages(step.stdout), ...compilerMessages(step.stderr)]),
        ...compilerMessages(result.result?.stderr),
        ...compilerMessages(result.stderr)
      ];
      if (diagnostics.length) lines.push(...diagnostics);
      const execution = result.execResult;
      if (execution) {
        failed ||= execution.code !== 0;
        lines.push(...compilerMessages(execution.stdout));
        const runtimeErrors = compilerMessages(execution.stderr);
        if (runtimeErrors.length) lines.push("Standard error:", ...runtimeErrors);
      } else if (!failed) {
        failed = true;
        lines.push("The build completed, but the compiler service did not run the program.");
      }
    } else {
      const build = result.buildResult || {};
      failed ||= build.code !== undefined && build.code !== 0;
      const buildDiagnostics = compilerMessages(build.stderr);
      if (buildDiagnostics.length) lines.push("Build diagnostics:", ...buildDiagnostics);
      const execution = result;
      failed ||= execution.code !== 0;
      lines.push(...compilerMessages(execution.stdout));
      const runtimeErrors = compilerMessages(execution.stderr);
      if (runtimeErrors.length) lines.push("Standard error:", ...runtimeErrors);
    }
    if (!lines.length) lines.push(failed ? "Build or execution failed; the service returned no diagnostics." : "Build succeeded; program returned no output.");
    return { text: lines.join("\n"), failed };
  }

  function parseArguments(text) {
    const matches = text.match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\S+/g) || [];
    return matches.map((argument) => {
      if ((argument.startsWith('"') && argument.endsWith('"')) || (argument.startsWith("'") && argument.endsWith("'"))) return argument.slice(1, -1);
      return argument;
    });
  }

  function queueExampleInput(exampleId, force = false) {
    const presets = { input: "Ada Lovelace\n", calculator: "6\n7\n" };
    const knownPresets = Object.values(presets);
    const preset = presets[exampleId];
    if (preset && (force || !stdin.value.trim() || knownPresets.includes(stdin.value))) {
      stdin.value = preset;
      activeProject().stdin = preset;
      scheduleSave();
    }
  }

  function loadRequestedSource() {
    const params = new URLSearchParams(location.search);
    const lessonId = params.get("lesson");
    const lesson = lessonId && lessons.find((item) => item.id === lessonId);
    if (lesson?.code && ["cpp", "c"].includes(lesson.track)) {
      const lang = lesson.track;
      const project = makeProject(`Lesson — ${lesson.title}`, lang, "empty", lesson.code);
      project.files = { [mainFilename(lang)]: lesson.code };
      project.activeFile = mainFilename(lang);
      project.openFiles = [project.activeFile];
      saveActiveFile();
      workspace.projects.push(project);
      workspace.activeProjectId = project.id;
      activateProject(project.id, false);
      return;
    }

    if (params.get("template") === "multi") {
      saveActiveFile();
      const project = makeProject("Multi-file C++ demo", "cpp", "multi");
      workspace.projects.push(project);
      workspace.activeProjectId = project.id;
      activateProject(project.id, false);
      return;
    }

    const requestedLanguage = params.get("lang");
    if (["c", "cpp"].includes(requestedLanguage) && requestedLanguage !== activeProject().language) {
      language.value = requestedLanguage;
      switchLanguage(requestedLanguage);
    }
    const exampleId = params.get("example");
    const requestedSource = exampleId && data.examples[activeProject().language][exampleId];
    if (requestedSource) {
      activeProject().files[activeProject().activeFile] = requestedSource;
      editor.value = requestedSource;
      const matching = Object.keys(data.examples[activeProject().language]).find((key) => data.examples[activeProject().language][key] === requestedSource);
      example.value = matching || "custom";
    }
    if (params.has("stdin")) stdin.value = params.get("stdin");
    if (params.has("args")) args.value = params.get("args");
    else if (exampleId && !stdin.value.trim()) queueExampleInput(exampleId);
    activeProject().stdin = stdin.value;
    activeProject().args = args.value;
    if (requestedSource || params.has("stdin") || params.has("args")) persistWorkspace();
    const action = params.get("action");
    if (action === "new-project") openDialog("project");
    if (action === "new-file") openDialog("file");
    if (action === "new-folder") openDialog("folder");
  }

  function exportProject() {
    saveActiveFile();
    const project = activeProject();
    const blob = new Blob([JSON.stringify({ format: "offset-project", version: 1, project }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "offset-project"}.offset.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importProject(file) {
    try {
      const parsed = JSON.parse(await file.text());
      const imported = normalizeProject(parsed.project || parsed);
      if (!imported) throw new Error("No supported C or C++ files were found.");
      imported.id = makeId();
      imported.name = uniqueProjectName(imported.name || file.name.replace(/\.json$/i, ""));
      saveActiveFile();
      workspace.projects.push(imported);
      workspace.activeProjectId = imported.id;
      activateProject(imported.id, false);
      setWorkspaceState("Imported and saved", "saved");
    } catch (error) {
      window.alert(`Could not import this workspace: ${error.message}`);
    }
  }

  function finishDialog() {
    const action = dialog.dataset.action;
    const name = nameInput.value.trim();
    if (!name) return showDialogError("Enter a name to continue.");
    let error = "";
    if (action === "project") {
      if (name.length > 64) return showDialogError("Project names must be 64 characters or fewer.");
      createProjectFromDialog(name);
    } else if (action === "file") {
      error = addFilePath(name);
    } else if (action === "folder") {
      error = addFolderPath(name);
    } else if (action === "renameFile") {
      error = renameFile(dialog.dataset.target, name);
    } else if (action === "renameFolder") {
      error = renameFolder(dialog.dataset.target, name);
    }
    if (error) return showDialogError(error);
    dialog.close();
  }

  language.addEventListener("change", () => switchLanguage(language.value));
  standard.addEventListener("change", () => {
    activeProject().standard = standard.value;
    persistWorkspace();
  });
  projectSelect.addEventListener("change", () => activateProject(projectSelect.value));
  example.addEventListener("change", () => queueExampleInput(example.value));
  document.getElementById("new-project").addEventListener("click", () => openDialog("project"));
  document.getElementById("new-file").addEventListener("click", () => openDialog("file"));
  document.getElementById("new-folder").addEventListener("click", () => openDialog("folder"));
  document.getElementById("delete-project").addEventListener("click", () => {
    if (workspace.projects.length === 1) return window.alert("Keep at least one project in the workspace.");
    const project = activeProject();
    if (!window.confirm(`Delete project “${project.name}” from this browser?`)) return;
    saveActiveFile();
    workspace.projects = workspace.projects.filter((item) => item.id !== project.id);
    workspace.activeProjectId = workspace.projects[0].id;
    activateProject(workspace.activeProjectId, false);
  });
  document.getElementById("export-project").addEventListener("click", exportProject);
  document.getElementById("import-project").addEventListener("click", () => document.getElementById("import-project-file").click());
  document.getElementById("import-project-file").addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) importProject(file);
    event.target.value = "";
  });

  document.getElementById("workspace-cancel").addEventListener("click", () => dialog.close());
  document.getElementById("workspace-dialog-close").addEventListener("click", () => dialog.close());
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    finishDialog();
  });
  document.getElementById("workspace-language").addEventListener("change", (event) => {
    const template = document.getElementById("workspace-template");
    const multi = template.querySelector('option[value="multi"]');
    multi.disabled = event.target.value !== "cpp";
    if (multi.disabled && template.value === "multi") template.value = "hello";
  });

  window.addEventListener("pagehide", () => {
    if (!workspaceReady) return;
    saveActiveFile();
    persistWorkspace();
  });

  tree.addEventListener("click", (event) => {
    const fileButton = event.target.closest("[data-file]");
    if (fileButton) {
      openFile(fileButton.dataset.file);
      currentFolder = fileButton.dataset.file.includes("/") ? fileButton.dataset.file.slice(0, fileButton.dataset.file.lastIndexOf("/")) : "";
      return;
    }
    const folderButton = event.target.closest("[data-folder]");
    if (folderButton) {
      const path = folderButton.dataset.folder;
      collapsedFolders.has(path) ? collapsedFolders.delete(path) : collapsedFolders.add(path);
      currentFolder = path;
      renderFileTree();
      return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const { action, path } = actionButton.dataset;
    if (action === "rename-file") openDialog("renameFile", path);
    if (action === "rename-folder") openDialog("renameFolder", path);
    if (action === "delete-file") deleteFile(path);
    if (action === "delete-folder") deleteFolder(path);
  });

  tabs.addEventListener("click", (event) => {
    const close = event.target.closest("[data-close-tab]");
    if (close) {
      closeTab(close.dataset.closeTab);
      return;
    }
    const tab = event.target.closest("[data-tab-path]");
    if (tab) openFile(tab.dataset.tabPath);
  });
  stdin.addEventListener("input", () => {
    activeProject().stdin = stdin.value;
    scheduleSave();
  });
  args.addEventListener("input", () => {
    activeProject().args = args.value;
    scheduleSave();
  });
  document.getElementById("clear-input").addEventListener("click", () => {
    stdin.value = "";
    activeProject().stdin = "";
    persistWorkspace();
    stdin.focus();
  });
  document.getElementById("try-name-input").addEventListener("click", () => {
    if (activeProject().language !== "cpp") switchLanguage("cpp");
    example.value = "input";
    example.dispatchEvent(new Event("change"));
    stdin.value = "Ada Lovelace\n";
    activeProject().stdin = stdin.value;
    persistWorkspace();
  });
  document.getElementById("try-number-input").addEventListener("click", () => {
    if (activeProject().language !== "cpp") switchLanguage("cpp");
    example.value = "calculator";
    example.dispatchEvent(new Event("change"));
    stdin.value = "6\n7\n";
    activeProject().stdin = stdin.value;
    persistWorkspace();
  });
  document.getElementById("clear-output").addEventListener("click", () => {
    output.textContent = "Console cleared.";
    document.getElementById("terminal-run-state").textContent = "No recent run";
    setStatus("Ready to build.", "idle");
  });
  runButton.addEventListener("click", runProgram);

  window.OFFSET_RUN_COMPILER = runProgram;
  window.OFFSET_WORKSPACE = {
    saveActiveFile,
    openFile,
    createFile: () => openDialog("file"),
    createFolder: () => openDialog("folder"),
    createProject: () => openDialog("project"),
    get project() { return activeProject(); }
  };

  renderProjectSelect();
  activateProject(workspace.activeProjectId);
  loadRequestedSource();
})();
