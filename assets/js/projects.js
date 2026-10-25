"use strict";

(() => {
  const projects = [
    { id: "tip-calculator", track: "cpp", title: "Two-number calculator", level: "Starter", time: "20 min", description: "Read two values, validate the input, then print a rounded result.", goals: ["cin and stream state", "floating-point output", "error paths"], example: "calculator", language: "cpp" },
    { id: "score-search", track: "cpp", title: "Find a score in a collection", level: "Starter", time: "25 min", description: "Sort a vector, search for a value, and report where it was found.", goals: ["std::vector", "iterators", "std::find"], example: "search", language: "cpp" },
    { id: "stdin-greeter", track: "cpp", title: "A greeter that reads a full line", level: "Starter", time: "15 min", description: "Handle spaces in input and make the compiler's stdin field do something useful.", goals: ["std::getline", "std::string", "input/output"], example: "input", language: "cpp" },
    { id: "pointer-notes", track: "cpp", title: "Trace a pointer", level: "Core C++", time: "25 min", description: "Print an object's value and address, then explain how the pointer relates to its lifetime.", goals: ["address-of", "dereference", "lifetime"], example: "pointer", language: "cpp" },
    { id: "c-array-search", track: "c", title: "Search a bounded C array", level: "Starter", time: "20 min", description: "Walk an array using a size computed from the array itself.", goals: ["size_t", "bounds", "loop conditions"], example: "search", language: "c" },
    { id: "c-input-check", track: "c", title: "Validate numeric input", level: "Starter", time: "20 min", description: "Read two numbers and handle a failed conversion before using the values.", goals: ["scanf return value", "standard input", "error handling"], example: "calculator", language: "c" },
    { id: "pe-tour", track: "systems", title: "Inspect a PE file you built", level: "Systems", time: "30 min", description: "Build a tiny executable locally, then map its headers, sections, and imports with a viewer.", goals: ["PE layout", "imports", "x86 vs x64"], lesson: "pe-and-dlls" },
    { id: "call-observer", track: "systems", title: "Instrument a call in your own program", level: "Systems", time: "30 min", description: "Wrap a function pointer in a test program and log arguments without patching another process.", goals: ["function pointers", "observation", "controlled scope"], lesson: "winapi-hooking" },
    { id: "multi-file-greeting", track: "cpp", title: "Split a program across files", level: "Core C++", time: "30 min", description: "Separate a declaration, implementation, and main function, then build the project as one program.", goals: ["headers", "translation units", "linking"], template: "multi", language: "cpp" },
    { id: "binary-map", track: "systems", title: "Map an executable's structure", level: "Low-level", time: "35 min", description: "Inspect a program you built and identify its architecture, sections, imports, and entry point.", goals: ["PE / ELF", "sections", "provenance"], lesson: "binary-formats" },
    { id: "blue-log-triage", track: "blue-team", title: "Triage a fictional process alert", level: "Blue team", time: "25 min", description: "Build an evidence timeline from a synthetic process tree and note what remains unverified.", goals: ["timestamps", "process lineage", "confidence"], lesson: "blue-process-triage" },
    { id: "osint-source-ledger", track: "osint", title: "Build a source ledger", level: "OSINT", time: "20 min", description: "Record source, capture time, evidence, confidence, and a privacy review for a public-interest question.", goals: ["provenance", "corroboration", "minimization"], lesson: "osint-source-validation" },
    { id: "red-scope-worksheet", track: "red-team", title: "Write a rules-of-engagement sheet", level: "Authorized testing", time: "20 min", description: "Define a local training target, explicit exclusions, an emergency contact, and a stop condition.", goals: ["authorization", "scope", "stop conditions"], lesson: "red-scope-and-rules" }
  ];

  const grid = document.getElementById("project-grid");
  const search = document.getElementById("project-search");
  const empty = document.getElementById("project-empty");
  const filters = [...document.querySelectorAll("[data-project-filter]")];
  if (!grid || !search) return;
  let activeFilter = "all";

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  function projectUrl(project) {
    if (project.template) return `./compiler.html?template=${encodeURIComponent(project.template)}&lang=${encodeURIComponent(project.language)}`;
    if (project.example) return `./compiler.html?example=${encodeURIComponent(project.example)}&lang=${encodeURIComponent(project.language)}`;
    return `./learn.html?track=${encodeURIComponent(project.track)}#lesson-${encodeURIComponent(project.lesson)}`;
  }

  function trackLabel(track) {
    return ({
      cpp: "C++", c: "C", systems: "Systems", "blue-team": "Blue team",
      "red-team": "Red team", osint: "OSINT"
    })[track] || track;
  }

  function card(project) {
    const element = document.createElement("article");
    element.className = "project-card";
    element.dataset.track = project.track;
      element.innerHTML = `
      <div class="project-card-top"><span class="project-track track-${escapeHtml(project.track)}">${escapeHtml(trackLabel(project.track))}</span><span>${escapeHtml(project.level)} · ${escapeHtml(project.time)}</span></div>
      <h2>${escapeHtml(project.title)}</h2>
      <p>${escapeHtml(project.description)}</p>
      <ul>${project.goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join("")}</ul>
      <a class="project-action" href="${projectUrl(project)}">${project.example ? "Open starter in compiler" : "Open the related note"}<span aria-hidden="true">↗</span></a>`;
    return element;
  }

  function render() {
    const term = search.value.trim().toLowerCase();
    const visible = projects.filter((project) => {
      const securityTracks = ["blue-team", "red-team", "osint"];
      const trackMatches = activeFilter === "all" || project.track === activeFilter || (activeFilter === "security" && securityTracks.includes(project.track));
      const content = `${project.title} ${project.description} ${project.goals.join(" ")} ${project.level}`.toLowerCase();
      return trackMatches && (!term || content.includes(term));
    });
    grid.replaceChildren(...visible.map(card));
    empty.hidden = visible.length > 0;
  }

  filters.forEach((button) => button.addEventListener("click", () => {
    activeFilter = button.dataset.projectFilter;
    filters.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    render();
  }));
  search.addEventListener("input", render);

  for (const track of ["all", "cpp", "c", "systems", "security"]) {
    const securityTracks = ["blue-team", "red-team", "osint"];
    const count = track === "all" ? projects.length : track === "security"
      ? projects.filter((project) => securityTracks.includes(project.track)).length
      : projects.filter((project) => project.track === track).length;
    const node = document.getElementById(`project-count-${track}`);
    if (node) node.textContent = String(count);
  }
  render();
})();
