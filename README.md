# OFFSET

A multi-page static learning site for C++, C, Windows systems, low-level computing, and security. It includes 80 study modules across eight tracks and can be hosted from a GitHub Pages repository root without a build step.

## Pages

- `index.html` — overview and section menu
- `learn.html` — 80 searchable chapter-style modules with worked examples, guided labs, key terms, self-checks, and local progress
- `compiler.html` — C/C++ workbench with local projects, folders, files, tabs, single- and multi-file builds, autocomplete, queued stdin, and arguments
- `projects.html` — starter projects that open in the compiler or related lesson
- `systems.html` — Windows APIs, PE/DLLs, memory, debugging, and low-level study paths
- `security.html` — authorized testing, blue-team, OSINT, advisories, and maintained security-news links
- `reference.html` — documentation links, number converter, and C++ check-in

## Preview locally

From this folder, start a static file server:

```powershell
python -m http.server 8000
```

Open <http://localhost:8000>. Use a server rather than opening the HTML files as `file://` URLs so the compiler request works.

## Publish with GitHub Pages

1. Push these files to the root of a GitHub repository.
2. Open **Settings → Pages**.
3. Choose **Deploy from a branch**, select your default branch, and choose `/(root)`.

Relative paths support project URLs such as `https://username.github.io/repository/`.

## Compiler and privacy

The workbench saves projects in browser storage. Pressing **Build & run** sends the project's C/C++ files, queued standard input, and arguments to the public Compiler Explorer API at `godbolt.org`. The site has no compile backend of its own. Its API runs a program to completion with the supplied input; it cannot pause for live typing at a `cin` prompt. Do not submit secrets or private code. Compiling requires an internet connection. The theme, font preferences, and course progress are stored locally too.

## Source material

The supplied `sa-com.zip` was a saved LearnCpp.com homepage plus WordPress theme, font, advertising, and analytics assets; it did not contain the tutorial lesson pages. OFFSET keeps the C++ learning goal, adds original modules and project prompts across eight tracks, and links to LearnCpp.com. The raw capture is not copied into the Pages site, so its tracking and advertising scripts are not deployed.

## Main source files

- `assets/js/app.js` — shared navigation and theme switcher
- `assets/js/lessons-data.js`, `assets/js/curriculum-data.js` — module catalog and track metadata
- `assets/js/deep-lessons-*.js` — foundational lesson notes for all 80 modules
- `assets/js/deep-expansion-*.js` — additional chapter sections, worked examples, guided labs, glossaries, and self-checks for all 80 modules
- `assets/js/learn.js` — track filters, module reader, and local progress
- `assets/js/editor-data.js`, `assets/js/editor.js`, `assets/js/compiler.js` — starters, workspace, autocomplete, and compiler API
- `assets/js/projects.js`, `assets/js/security.js`, `assets/js/systems.js` — project catalog and learning paths
- `assets/js/reference.js` — reference tools
- `assets/css/styles.css` — monochrome theme and responsive layouts

The shared command palette opens with **Ctrl+K** (or **⌘K**). The **Aa** control changes interface and code fonts. Projects can be exported/imported as `.offset.json` files; the workspace is otherwise local to the browser profile.
