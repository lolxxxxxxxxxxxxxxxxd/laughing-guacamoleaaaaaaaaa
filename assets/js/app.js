"use strict";

(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById("theme-toggle");
  const themeLabel = document.getElementById("theme-label");
  const themeIcon = document.getElementById("theme-icon");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const menuButton = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");
  const preferenceKey = "offset.appearance.v1";
  let paletteCommands = [];
  let activeCommandIndex = 0;

  function setTheme(theme, persist = true) {
    const nextTheme = theme === "light" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    if (themeLabel) themeLabel.textContent = nextTheme === "dark" ? "Light theme" : "Dark theme";
    if (themeIcon) themeIcon.textContent = nextTheme === "dark" ? "◐" : "◑";
    if (themeButton) {
      themeButton.setAttribute("aria-label", `Switch to ${nextTheme === "dark" ? "light" : "dark"} theme`);
      themeButton.setAttribute("aria-pressed", String(nextTheme === "light"));
    }
    if (themeColor) themeColor.content = nextTheme === "dark" ? "#101112" : "#f4f4f2";
    if (persist) {
      try { localStorage.setItem("offset.theme", nextTheme); } catch { /* Keep the current page usable. */ }
    }
  }

  if (themeButton) {
    setTheme(root.dataset.theme || "dark", false);
    themeButton.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
  }

  function applyAppearance(settings) {
    const bodyFont = ["dm-sans", "system", "serif", "arial"].includes(settings.bodyFont) ? settings.bodyFont : "dm-sans";
    const codeFont = ["ibm-plex", "cascadia", "consolas", "courier"].includes(settings.codeFont) ? settings.codeFont : "ibm-plex";
    root.dataset.bodyFont = bodyFont;
    root.dataset.codeFont = codeFont;
    const bodySelect = document.getElementById("body-font-select");
    const codeSelect = document.getElementById("code-font-select");
    if (bodySelect) bodySelect.value = bodyFont;
    if (codeSelect) codeSelect.value = codeFont;
  }

  function readAppearance() {
    try {
      const saved = JSON.parse(localStorage.getItem(preferenceKey) || "{}");
      applyAppearance(saved || {});
    } catch {
      applyAppearance({});
    }
  }

  function saveAppearance() {
    const settings = {
      bodyFont: document.getElementById("body-font-select").value,
      codeFont: document.getElementById("code-font-select").value
    };
    applyAppearance(settings);
    try { localStorage.setItem(preferenceKey, JSON.stringify(settings)); } catch { /* Preferences still apply for this visit. */ }
  }

  const headerTools = document.querySelector(".header-tools");
  const preferencesDialog = document.createElement("dialog");
  preferencesDialog.className = "preferences-dialog";
  preferencesDialog.setAttribute("aria-labelledby", "preferences-title");
  preferencesDialog.innerHTML = `
    <form method="dialog" class="preferences-form">
      <div class="dialog-heading"><span class="dialog-symbol" aria-hidden="true">Aa</span><div><p>DISPLAY</p><h2 id="preferences-title">Reading preferences</h2></div><button class="dialog-close" type="submit" aria-label="Close settings">×</button></div>
      <label class="preference-field" for="body-font-select"><span>Interface font</span><select id="body-font-select"><option value="dm-sans">DM Sans</option><option value="system">System sans</option><option value="serif">Georgia serif</option><option value="arial">Arial</option></select></label>
      <label class="preference-field" for="code-font-select"><span>Code font</span><select id="code-font-select"><option value="ibm-plex">IBM Plex Mono</option><option value="cascadia">Cascadia Code</option><option value="consolas">Consolas</option><option value="courier">Courier New</option></select></label>
      <p class="preferences-note">Your choices apply across OFFSET and stay in this browser.</p>
    </form>`;
  document.body.append(preferencesDialog);
  readAppearance();

  if (headerTools) {
    const preferencesButton = document.createElement("button");
    preferencesButton.type = "button";
    preferencesButton.className = "appearance-button";
    preferencesButton.setAttribute("aria-label", "Change interface and code fonts");
    preferencesButton.title = "Reading preferences";
    preferencesButton.textContent = "Aa";
    themeButton?.after(preferencesButton);
    preferencesButton.addEventListener("click", () => preferencesDialog.showModal());

    preferencesDialog.addEventListener("change", (event) => {
      if (event.target.matches("select")) saveAppearance();
    });

    const paletteButton = document.createElement("button");
    paletteButton.type = "button";
    paletteButton.className = "command-button";
    paletteButton.setAttribute("aria-label", "Open command palette");
    paletteButton.title = "Command palette · Ctrl+K";
    paletteButton.innerHTML = '<span>⌘K</span>';
    preferencesButton.after(paletteButton);

    const palette = document.createElement("dialog");
    palette.className = "command-palette";
    palette.setAttribute("aria-labelledby", "palette-title");
    palette.innerHTML = `
      <div class="palette-search-row"><span class="palette-prompt" aria-hidden="true">&gt;</span><label class="visually-hidden" id="palette-title" for="palette-search">Search commands</label><input id="palette-search" type="search" placeholder="Search pages and actions…" autocomplete="off" spellcheck="false"><kbd>ESC</kbd></div>
      <div class="palette-results" id="palette-results" role="listbox" aria-label="Commands"></div>
      <div class="palette-footer"><span>Navigate with ↑ ↓</span><span>Enter to run</span></div>`;
    document.body.append(palette);
    const paletteInput = palette.querySelector("#palette-search");
    const paletteResults = palette.querySelector("#palette-results");

    paletteCommands = [
      { label: "Open learning library", group: "Pages", keywords: "learn courses modules cpp c", href: "./learn.html" },
      { label: "Open compiler workbench", group: "Pages", keywords: "compiler ide code files project", href: "./compiler.html" },
      { label: "Open projects", group: "Pages", keywords: "starter build", href: "./projects.html" },
      { label: "Open Windows systems", group: "Pages", keywords: "win32 kernel internals low-level", href: "./systems.html" },
      { label: "Open security desk", group: "Pages", keywords: "red blue team osint news cyber", href: "./security.html" },
      { label: "Open reference shelf", group: "Pages", keywords: "docs tools links", href: "./reference.html" },
      { label: "Switch color theme", group: "Appearance", keywords: "dark light grayscale", run: () => setTheme(root.dataset.theme === "dark" ? "light" : "dark") },
      { label: "Change fonts", group: "Appearance", keywords: "type typography reading code", run: () => preferencesDialog.showModal() },
      { label: "Create a project", group: "Workbench", keywords: "new project compiler files", href: "./compiler.html?action=new-project" },
      { label: "Create a file", group: "Workbench", keywords: "new file source cpp", href: "./compiler.html?action=new-file" },
      { label: "Create a folder", group: "Workbench", keywords: "new folder directory", href: "./compiler.html?action=new-folder" }
    ];

    function chooseCommand(index) {
      const command = paletteCommands[index];
      if (!command) return;
      palette.close();
      if (command.run) command.run();
      else if (command.href) location.href = command.href;
    }

    function renderCommands() {
      const term = paletteInput.value.trim().toLowerCase();
      const matches = paletteCommands
        .map((command, index) => ({ ...command, index }))
        .filter((command) => `${command.label} ${command.group} ${command.keywords}`.toLowerCase().includes(term));
      if (!matches.length) {
        paletteResults.innerHTML = '<p class="palette-empty">No matching commands.</p>';
        activeCommandIndex = -1;
        return;
      }
      activeCommandIndex = Math.max(0, Math.min(activeCommandIndex, matches.length - 1));
      paletteResults.replaceChildren(...matches.map((command, position) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `palette-command${position === activeCommandIndex ? " is-active" : ""}`;
        button.setAttribute("role", "option");
        button.setAttribute("aria-selected", String(position === activeCommandIndex));
        button.dataset.commandIndex = String(command.index);
        button.innerHTML = `<span class="palette-command-name">${command.label}</span><span class="palette-command-group">${command.group}</span>`;
        button.addEventListener("mousemove", () => {
          if (activeCommandIndex === position) return;
          activeCommandIndex = position;
          [...paletteResults.querySelectorAll("[role='option']")].forEach((option, optionIndex) => {
            const active = optionIndex === position;
            option.classList.toggle("is-active", active);
            option.setAttribute("aria-selected", String(active));
          });
        });
        button.addEventListener("click", () => chooseCommand(command.index));
        return button;
      }));
    }

    function openPalette() {
      if (preferencesDialog.open) preferencesDialog.close();
      paletteInput.value = "";
      activeCommandIndex = 0;
      renderCommands();
      palette.showModal();
      requestAnimationFrame(() => paletteInput.focus());
    }

    paletteButton.addEventListener("click", openPalette);
    paletteInput.addEventListener("input", () => {
      activeCommandIndex = 0;
      renderCommands();
    });
    paletteInput.addEventListener("keydown", (event) => {
      const options = [...paletteResults.querySelectorAll("[data-command-index]")];
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!options.length) return;
        activeCommandIndex = (activeCommandIndex + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length;
        renderCommands();
      } else if (event.key === "Enter") {
        event.preventDefault();
        const selected = options[activeCommandIndex];
        if (selected) chooseCommand(Number(selected.dataset.commandIndex));
      }
    });
    palette.addEventListener("click", (event) => {
      if (event.target === palette) palette.close();
    });
    paletteButton._openPalette = openPalette;
  }

  function closeMenu() {
    if (!menuButton || !siteNav) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    siteNav.classList.remove("is-open");
  }

  if (menuButton && siteNav) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      siteNav.classList.toggle("is-open", open);
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
        closeMenu();
        menuButton.focus();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      document.querySelector(".command-button")?._openPalette?.();
    }
  });
})();
