"use strict";

(() => {
  const data = window.OFFSET_EDITOR_DATA;
  const editor = document.getElementById("code-editor");
  const lineNumbers = document.getElementById("line-numbers");
  const syntaxLayer = document.querySelector(".syntax-layer");
  const syntaxCode = document.getElementById("syntax-code");
  const editorWrap = document.getElementById("editor-wrap");
  const popup = document.getElementById("completion-popup");
  const language = document.getElementById("language-select");
  const example = document.getElementById("example-select");
  const editorState = document.getElementById("editor-state");
  const editorKey = data?.storageKeys || { c: "fieldnotes.editor.c.v1", cpp: "fieldnotes.editor.cpp.v1" };

  if (!data || !editor || !popup) return;

  let choices = [];
  let selectedChoice = 0;
  let activeContext = null;

  function setState(message) {
    editorState.textContent = message;
  }

  function saveCode() {
    if (window.OFFSET_WORKSPACE) {
      window.OFFSET_WORKSPACE.saveActiveFile(editor.value);
      return;
    }
    try {
      localStorage.setItem(editorKey[language.value], editor.value);
    } catch {
      // The editor still works when browser storage is disabled.
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function updateLineNumbers() {
    const count = Math.max(1, editor.value.split("\n").length);
    lineNumbers.replaceChildren(...Array.from({ length: count }, (_, index) => {
      const line = document.createElement("span");
      line.textContent = String(index + 1);
      return line;
    }));
    document.getElementById("line-count").textContent = `${count} ${count === 1 ? "line" : "lines"}`;
    lineNumbers.scrollTop = editor.scrollTop;
  }

  function highlightSource() {
    const source = editor.value;
    if (source.length > 50000) {
      syntaxCode.textContent = source;
      return;
    }

    const keywords = language.value === "c" ? data.cKeywords : data.cppKeywords;
    const types = language.value === "c" ? data.cTypes : data.cppTypes;
    const tokenPattern = /\/\*([\s\S]*?\*\/|$)|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[^\n]*|\b(?:0[xX][\da-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b|[A-Za-z_]\w*/g;
    let markup = "";
    let lastIndex = 0;
    let match;

    while ((match = tokenPattern.exec(source)) !== null) {
      const token = match[0];
      let kind = "";
      if (token.startsWith("//") || token.startsWith("/*")) kind = "tok-comment";
      else if (token.startsWith("\"") || token.startsWith("'")) kind = "tok-string";
      else if (token.startsWith("#")) kind = "tok-preprocessor";
      else if (/^(?:0[xX][\da-fA-F]+|\d)/.test(token)) kind = "tok-number";
      else if (["true", "false", "nullptr", "NULL", "NULLPTR"].includes(token)) kind = "tok-constant";
      else if (types.has(token)) kind = "tok-type";
      else if (keywords.has(token)) kind = "tok-keyword";
      else if (token === "std") kind = "tok-namespace";
      else if (/^\s*\(/.test(source.slice(tokenPattern.lastIndex))) kind = "tok-function";

      markup += escapeHtml(source.slice(lastIndex, match.index));
      markup += kind ? `<span class="${kind}">${escapeHtml(token)}</span>` : escapeHtml(token);
      lastIndex = tokenPattern.lastIndex;
    }

    markup += escapeHtml(source.slice(lastIndex));
    syntaxCode.innerHTML = markup;
  }

  function syncScroll() {
    lineNumbers.scrollTop = editor.scrollTop;
    syntaxLayer.scrollTop = editor.scrollTop;
    syntaxLayer.scrollLeft = editor.scrollLeft;
    if (!popup.hidden && activeContext) positionPopup(activeContext);
  }

  function refreshEditor() {
    updateLineNumbers();
    highlightSource();
    syncScroll();
  }

  function detectExample() {
    const examples = data.examples[language.value];
    const found = Object.entries(examples).find(([, source]) => source === editor.value);
    example.value = found ? found[0] : "custom";
  }

  function hidePopup() {
    popup.hidden = true;
    popup.replaceChildren();
    choices = [];
    activeContext = null;
    editor.setAttribute("aria-expanded", "false");
    editor.removeAttribute("aria-activedescendant");
  }

  function findContext(manual = false) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    if (start !== end) return manual ? { kind: "symbol", prefix: "", from: start, to: end } : null;

    const before = editor.value.slice(0, start);
    const lineStart = before.lastIndexOf("\n") + 1;
    const currentLine = before.slice(lineStart);
    const includeMatch = currentLine.match(/^\s*#\s*include\s+([<"])([^>"\n]*)$/);
    if (includeMatch) {
      const prefix = includeMatch[2];
      return {
        kind: "header",
        prefix,
        from: start - prefix.length,
        to: start,
        closeChar: includeMatch[1] === "<" ? ">" : "\""
      };
    }

    const directiveMatch = currentLine.match(/^\s*#([A-Za-z]*)$/);
    if (directiveMatch && (directiveMatch[1] || manual)) {
      return {
        kind: "directive",
        prefix: directiveMatch[1],
        from: start - directiveMatch[1].length,
        to: start
      };
    }

    const token = before.match(/[A-Za-z_][A-Za-z_0-9:]*$/);
    const prefix = token ? token[0] : "";
    if (prefix && (prefix.length >= 2 || prefix.includes("::") || manual)) {
      return { kind: "symbol", prefix, from: start - prefix.length, to: start };
    }

    return manual ? { kind: "symbol", prefix: "", from: start, to: end } : null;
  }

  function findChoices(context) {
    if (context.kind === "header") {
      const headers = language.value === "c" ? data.cHeaders : data.cppHeaders;
      return headers
        .filter((header) => header.toLowerCase().startsWith(context.prefix.toLowerCase()))
        .filter((header) => header.toLowerCase() !== context.prefix.toLowerCase())
        .slice(0, 9)
        .map((label) => ({ label, detail: "standard header", insertText: label }));
    }

    if (context.kind === "directive") {
      return ["include", "define", "ifdef", "ifndef", "pragma", "undef"]
        .filter((word) => word.toLowerCase().startsWith(context.prefix.toLowerCase()))
        .filter((word) => word.toLowerCase() !== context.prefix.toLowerCase())
        .slice(0, 9)
        .map((word) => ({ label: `#${word}`, detail: "preprocessor directive", insertText: word }));
    }

    const builtIns = language.value === "c" ? data.cCompletions : data.cppCompletions;
    const localWords = [...new Set(editor.value.match(/[A-Za-z_]\w*/g) || [])]
      .filter((word) => word.toLowerCase().startsWith(context.prefix.toLowerCase()))
      .map((word) => ({ label: word, detail: "in this file", insertText: word }));
    const unique = new Map();
    for (const item of [...localWords, ...builtIns]) {
      if (!unique.has(item.label)) unique.set(item.label, item);
    }

    return [...unique.values()]
      .filter((item) => item.label.toLowerCase().startsWith(context.prefix.toLowerCase()))
      .filter((item) => item.label.toLowerCase() !== context.prefix.toLowerCase())
      .slice(0, 9);
  }

  function positionPopup(context) {
    const before = editor.value.slice(0, editor.selectionStart);
    const lines = before.split("\n");
    const currentLine = lines[lines.length - 1].replace(/\t/g, "    ");
    const style = window.getComputedStyle(editor);
    const lineHeight = Number.parseFloat(style.lineHeight) || 19;
    const paddingTop = Number.parseFloat(style.paddingTop) || 20;
    const paddingLeft = Number.parseFloat(style.paddingLeft) || 16;
    const canvas = positionPopup.canvas || (positionPopup.canvas = document.createElement("canvas"));
    const context2d = canvas.getContext("2d");
    context2d.font = style.font;
    const textWidth = context2d.measureText(currentLine).width;
    const popupWidth = popup.offsetWidth || 290;
    const maxLeft = Math.max(54, editorWrap.clientWidth - popupWidth - 7);
    const left = Math.max(54, Math.min(48 + paddingLeft + textWidth - editor.scrollLeft, maxLeft));
    const caretY = paddingTop + (lines.length - 1) * lineHeight - editor.scrollTop;
    const popupHeight = popup.offsetHeight || 190;
    let top = caretY + lineHeight + 4;
    if (top + popupHeight > editorWrap.clientHeight - 5) top = Math.max(5, caretY - popupHeight - 4);
    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  }

  function setActiveChoice(index) {
    if (!choices.length) return;
    selectedChoice = (index + choices.length) % choices.length;
    const options = [...popup.querySelectorAll("[role='option']")];
    options.forEach((option, optionIndex) => {
      const active = optionIndex === selectedChoice;
      option.classList.toggle("is-active", active);
      option.setAttribute("aria-selected", String(active));
    });
    const activeOption = options[selectedChoice];
    if (activeOption) {
      editor.setAttribute("aria-activedescendant", activeOption.id);
      activeOption.scrollIntoView({ block: "nearest" });
    }
  }

  function acceptChoice(index) {
    const choice = choices[index];
    const context = activeContext;
    if (!choice || !context) return;

    let insertion = choice.insertText;
    if (context.kind === "header" && !editor.value.slice(context.to).startsWith(context.closeChar)) {
      insertion += context.closeChar;
    }
    editor.setRangeText(insertion, context.from, context.to, "end");
    const caret = context.from + insertion.length;
    editor.setSelectionRange(caret, caret);
    hidePopup();
    onEditorInput();
    setState(`Inserted ${choice.label}`);
    editor.focus();
  }

  function showPopup(manual = false) {
    if (!manual && document.activeElement !== editor) return hidePopup();
    const context = findContext(manual);
    if (!context) return hidePopup();
    const suggestions = findChoices(context);
    if (!suggestions.length) {
      hidePopup();
      setState(manual ? "No suggestions for this text" : "Ready");
      return;
    }

    activeContext = context;
    choices = suggestions;
    selectedChoice = 0;
    popup.replaceChildren(...suggestions.map((suggestion, index) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "completion-item";
      option.id = `completion-option-${index}`;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", String(index === 0));
      option.tabIndex = -1;
      option.innerHTML = `<span class="completion-label">${escapeHtml(suggestion.label)}</span><span class="completion-detail">${escapeHtml(suggestion.detail)}</span>`;
      option.addEventListener("mousedown", (event) => event.preventDefault());
      option.addEventListener("click", () => acceptChoice(index));
      return option;
    }));
    popup.hidden = false;
    editor.setAttribute("aria-expanded", "true");
    editor.setAttribute("aria-activedescendant", "completion-option-0");
    setState(`${suggestions.length} ${suggestions.length === 1 ? "suggestion" : "suggestions"}`);
    positionPopup(context);
    setActiveChoice(0);
  }

  function onEditorInput() {
    example.value = "custom";
    saveCode();
    refreshEditor();
    showPopup(false);
  }

  function insertText(text, start = editor.selectionStart, end = editor.selectionEnd, offset = text.length) {
    editor.setRangeText(text, start, end, "end");
    const caret = start + offset;
    editor.setSelectionRange(caret, caret);
    onEditorInput();
  }

  function handleKeydown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && typeof window.OFFSET_RUN_COMPILER === "function") {
      event.preventDefault();
      window.OFFSET_RUN_COMPILER();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && (event.code === "Space" || event.key === " ")) {
      event.preventDefault();
      showPopup(true);
      return;
    }

    if (!popup.hidden) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveChoice(selectedChoice + 1);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveChoice(selectedChoice - 1);
        return;
      }
      if (event.key === "Tab" && event.shiftKey) {
        event.preventDefault();
        setActiveChoice(selectedChoice - 1);
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        acceptChoice(selectedChoice);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        hidePopup();
        setState("Suggestions closed");
        return;
      }
      hidePopup();
    }

    if (event.key === "Tab") {
      event.preventDefault();
      if (!event.shiftKey) {
        insertText("    ");
        return;
      }
      if (editor.selectionStart !== editor.selectionEnd) return;
      const cursor = editor.selectionStart;
      const lineStart = editor.value.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
      const prefix = editor.value.slice(lineStart, cursor);
      if (!/^[\t ]*$/.test(prefix)) return;
      const indent = prefix.match(/(?: {1,4}|\t)$/)?.[0];
      if (!indent) return;
      const start = cursor - indent.length;
      editor.setRangeText("", start, cursor, "end");
      editor.setSelectionRange(start, start);
      onEditorInput();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const before = editor.value.slice(0, start);
      const after = editor.value.slice(end);
      const lineStart = before.lastIndexOf("\n") + 1;
      const currentLine = before.slice(lineStart);
      const indent = (currentLine.match(/^[\t ]*/) || [""])[0].replace(/\t/g, "    ");
      const opensBlock = /\{\s*$/.test(currentLine);

      if (opensBlock && after.startsWith("}")) {
        const insertion = `\n${indent}    \n${indent}`;
        insertText(insertion, start, end, 1 + indent.length + 4);
      } else {
        insertText(`\n${indent}${opensBlock ? "    " : ""}`, start, end);
      }
      return;
    }

    if (event.key === "Backspace" && editor.selectionStart === editor.selectionEnd) {
      const cursor = editor.selectionStart;
      const pairs = { "(": ")", "[": "]", "{": "}", "\"": "\"", "'": "'" };
      if (pairs[editor.value[cursor - 1]] === editor.value[cursor]) {
        event.preventDefault();
        editor.setRangeText("", cursor - 1, cursor + 1, "end");
        editor.setSelectionRange(cursor - 1, cursor - 1);
        onEditorInput();
        return;
      }
    }

    const pairs = { "(": ")", "[": "]", "{": "}", "\"": "\"", "'": "'" };
    if (Object.hasOwn(pairs, event.key)) {
      event.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const selected = editor.value.slice(start, end);
      insertText(`${event.key}${selected}${pairs[event.key]}`, start, end, 1 + selected.length);
      return;
    }

    if ([")", "]", "}", "\"", "'"].includes(event.key)
      && editor.selectionStart === editor.selectionEnd
      && editor.value[editor.selectionStart] === event.key) {
      event.preventDefault();
      const caret = editor.selectionStart + 1;
      editor.setSelectionRange(caret, caret);
    }
  }

  function onExampleChange() {
    const snippet = data.examples[language.value][example.value];
    if (!snippet) return;
    editor.value = snippet;
    saveCode();
    refreshEditor();
    hidePopup();
    setState("Example loaded");
    editor.focus();
  }

  function onRestoreExample() {
    const sampleName = example.value === "custom" ? "hello" : example.value;
    example.value = sampleName;
    editor.value = data.examples[language.value][sampleName] || data.examples[language.value].hello;
    saveCode();
    refreshEditor();
    hidePopup();
    setState("Example restored");
  }

  function onLanguageChange() {
    refreshEditor();
    hidePopup();
    const matching = Object.entries(data.examples[language.value]).find(([, source]) => source === editor.value);
    example.value = matching ? matching[0] : "custom";
  }

  function handleDocumentClick(event) {
    if (!event.target.closest(".editor-wrap")) hidePopup();
  }

  editor.addEventListener("input", onEditorInput);
  editor.addEventListener("keydown", handleKeydown);
  editor.addEventListener("scroll", syncScroll);
  editor.addEventListener("focus", () => {
    detectExample();
    refreshEditor();
  });
  editor.addEventListener("click", () => showPopup(false));
  editor.addEventListener("keyup", (event) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) showPopup(false);
  });
  example.addEventListener("change", onExampleChange);
  language.addEventListener("change", onLanguageChange);
  document.getElementById("reset-code").addEventListener("click", onRestoreExample);
  document.addEventListener("click", handleDocumentClick);

  window.OFFSET_EDITOR = { refresh: refreshEditor };
  refreshEditor();
  const currentExample = Object.entries(data.examples[language.value]).find(([, source]) => source === editor.value);
  example.value = currentExample ? currentExample[0] : "custom";
})();
