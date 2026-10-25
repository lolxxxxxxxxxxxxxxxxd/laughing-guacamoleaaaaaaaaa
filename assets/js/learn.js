"use strict";

(() => {
  const lessons = (window.OFFSET_LESSONS || []).map((lesson) => {
    const depth = window.OFFSET_DEEP_LESSONS?.[lesson.id];
    if (!depth) return lesson;
    return {
      ...lesson,
      depth,
      time: depth.time || lesson.time,
      sections: [...lesson.sections, ...depth.sections],
      code: lesson.code || depth.code,
      codeTitle: lesson.codeTitle || depth.codeTitle
    };
  });
  const tracks = window.OFFSET_TRACKS || [];
  const grid = document.getElementById("lesson-grid");
  const reader = document.getElementById("lesson-reader");
  const search = document.getElementById("lesson-search");
  const empty = document.getElementById("empty-state");
  const filterHost = document.getElementById("track-filters");
  if (!grid || !reader || !search || !filterHost) return;

  const progressKey = "offset.progress.v1";
  const legacyProgressKey = "fieldnotes.progress.v1";
  let activeFilter = "all";
  let activeLessonId = null;
  let filters = [];
  let completed = loadProgress();

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(progressKey) || localStorage.getItem(legacyProgressKey) || "[]";
      const saved = JSON.parse(raw);
      const valid = new Set(lessons.map((lesson) => lesson.id));
      return new Set(Array.isArray(saved) ? saved.filter((id) => valid.has(id)) : []);
    } catch {
      return new Set();
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(progressKey, JSON.stringify([...completed]));
    } catch {
      // Progress remains usable for this visit if storage is unavailable.
    }
  }

  function nextLesson() {
    return lessons.find((lesson) => !completed.has(lesson.id)) || lessons[0];
  }

  function trackDescription(id) {
    return id === "all"
      ? "Choose a learning track or search across the whole library."
      : tracks.find((track) => track.id === id)?.description || "Explore this track's modules.";
  }

  function updateProgress() {
    const total = lessons.length;
    const done = Math.min(completed.size, total);
    const percent = total ? Math.round(done / total * 100) : 0;
    document.getElementById("progress-fill").style.width = `${percent}%`;
    document.getElementById("progress-count").textContent = `${done} / ${total} modules`;
    document.getElementById("progress-percent").textContent = `${percent}%`;
    const meter = document.querySelector(".progress-meter");
    meter.setAttribute("aria-valuemax", String(total));
    meter.setAttribute("aria-valuenow", String(done));
    const next = nextLesson();
    document.getElementById("continue-learning").textContent = `${done === total ? "Review" : "Continue with"} module ${next.number}`;

    for (const card of grid.querySelectorAll(".lesson-card")) {
      const isDone = completed.has(card.dataset.lessonId);
      card.classList.toggle("is-complete", isDone);
      const flag = card.querySelector(".lesson-state");
      if (flag) flag.textContent = isDone ? "Complete" : "Open";
    }

    const toggle = reader.querySelector("[data-action='complete']");
    if (toggle && activeLessonId) {
      const isDone = completed.has(activeLessonId);
      toggle.setAttribute("aria-pressed", String(isDone));
      toggle.textContent = isDone ? "Completed · undo" : "Mark complete";
      toggle.classList.toggle("is-complete", isDone);
    }
  }

  function renderFilters() {
    const allButton = document.createElement("button");
    allButton.type = "button";
    allButton.className = "filter-button is-active";
    allButton.dataset.filter = "all";
    allButton.setAttribute("aria-pressed", "true");
    allButton.innerHTML = `All tracks <span>${lessons.length}</span>`;
    const trackButtons = tracks.map((track) => {
      const count = lessons.filter((lesson) => lesson.track === track.id).length;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-button";
      button.dataset.filter = track.id;
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", `${track.title}, ${count} modules`);
      button.innerHTML = `${escapeHtml(track.label)} <span>${count}</span>`;
      return button;
    });
    filterHost.replaceChildren(allButton, ...trackButtons);
    filters = [allButton, ...trackButtons];
    filters.forEach((button) => button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      filters.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      document.getElementById("track-summary").textContent = trackDescription(activeFilter);
      document.getElementById("course-title").textContent = activeFilter === "all"
        ? "All modules"
        : tracks.find((track) => track.id === activeFilter)?.title || "Modules";
      renderList();
    }));

    document.getElementById("lesson-total").textContent = `${lessons.length} study modules`;
    document.getElementById("track-total").textContent = `${tracks.length} learning tracks`;
  }

  function makeCard(lesson) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lesson-card";
    button.dataset.lessonId = lesson.id;
    button.dataset.track = lesson.track;
    button.setAttribute("aria-label", `${lesson.number}. ${lesson.title}, ${lesson.time}`);
    button.innerHTML = `
      <span class="lesson-number">${escapeHtml(lesson.number)}</span>
      <span class="lesson-card-body">
        <span class="lesson-card-meta"><span class="track-label track-${escapeHtml(lesson.track)}">${escapeHtml(lesson.label)}</span><span>${escapeHtml(lesson.time)}</span></span>
        <strong>${escapeHtml(lesson.title)}</strong>
        <small>${escapeHtml(lesson.description)}</small>
      </span>
      <span class="lesson-card-state"><span class="lesson-state">${completed.has(lesson.id) ? "Complete" : "Open"}</span><b aria-hidden="true">↗</b></span>`;
    return button;
  }

  function renderList() {
    const term = search.value.trim().toLowerCase();
    const visible = lessons.filter((lesson) => {
      const trackMatches = activeFilter === "all" || lesson.track === activeFilter;
      const text = [lesson.title, lesson.description, lesson.label, lesson.level, lesson.summary,
        lesson.focus.join(" "), lesson.exercise, ...(lesson.sections || []).flatMap((section) => [section.heading, ...section.paragraphs]),
        lesson.depth?.prerequisites || "", ...(lesson.depth?.pitfalls || []), ...(lesson.depth?.practiceSteps || []),
        lesson.depth?.checkpoint?.question || "", lesson.depth?.checkpoint?.answer || "",
        JSON.stringify(lesson.depth?.workedExample || {}), JSON.stringify(lesson.depth?.lab || {}),
        JSON.stringify(lesson.depth?.glossary || []), JSON.stringify(lesson.depth?.checkpoints || [])]
        .join(" ").toLowerCase();
      return trackMatches && (!term || text.includes(term));
    });
    grid.replaceChildren(...visible.map(makeCard));
    empty.hidden = visible.length > 0;
    document.getElementById("visible-count").textContent = `${visible.length} ${visible.length === 1 ? "module" : "modules"}`;
    updateProgress();
  }

  function renderLesson(lesson) {
    const index = lessons.findIndex((item) => item.id === lesson.id);
    const next = lessons[(index + 1) % lessons.length];
    const depth = lesson.depth || {};
    const sectionIds = lesson.sections.map((_, sectionIndex) => `reader-section-${lesson.id}-${sectionIndex}`);
    const sections = lesson.sections.map((section, sectionIndex) => `
      <section class="reader-section" id="${sectionIds[sectionIndex]}"><h3 tabindex="-1">${escapeHtml(section.heading)}</h3>
      ${section.paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}</section>`).join("");
    const pitfalls = depth.pitfalls?.length ? `
      <section class="reader-pitfalls" id="reader-pitfalls"><h3>Common mistakes</h3><ul>${depth.pitfalls.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>` : "";
    const practiceSteps = depth.practiceSteps?.length > 0;
    const checkpoint = depth.checkpoint ? `
      <details class="reader-checkpoint" id="reader-checkpoint"><summary>Check your understanding</summary><div class="checkpoint-body"><p class="checkpoint-question">${escapeHtml(depth.checkpoint.question)}</p><p class="checkpoint-answer-label">Answer</p><p>${escapeHtml(depth.checkpoint.answer)}</p></div></details>` : "";
    const prerequisites = depth.prerequisites ? `
      <div class="reader-prerequisites"><span>Before this module</span><p>${escapeHtml(depth.prerequisites)}</p></div>` : "";
    const code = lesson.code ? `
      <section class="lesson-code-block" id="reader-code" aria-label="Runnable code example"><div><span>${escapeHtml(lesson.codeTitle || "Example")}</span><button type="button" data-action="copy">Copy</button></div><pre><code>${escapeHtml(lesson.code)}</code></pre></section>` : "";
    const canCompile = lesson.code && ["cpp", "c"].includes(lesson.track);
    const compilerAction = canCompile
      ? `<a class="button button-secondary" href="./compiler.html?lesson=${encodeURIComponent(lesson.id)}">Open this code in the compiler</a>`
      : "";
    const workedExample = depth.workedExample ? `
      <section class="reader-worked-example" id="reader-worked-example">
        <p class="reader-block-label">Worked example</p><h3>${escapeHtml(depth.workedExample.title)}</h3>
        <p>${escapeHtml(depth.workedExample.scenario)}</p>
        <ol>${depth.workedExample.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        <div class="worked-example-result"><strong>What to notice</strong><p>${escapeHtml(depth.workedExample.result)}</p></div>
      </section>` : "";
    const lab = depth.lab ? `
      <section class="reader-lab" id="reader-lab">
        <p class="reader-block-label">Applied lab</p><h3>${escapeHtml(depth.lab.title)}</h3>
        <p class="lab-objective">${escapeHtml(depth.lab.objective)}</p><p>${escapeHtml(depth.lab.prompt)}</p>
        <ol>${depth.lab.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        <div class="lab-completion"><strong>You're done when</strong><p>${escapeHtml(depth.lab.completion)}</p></div>
        <details class="lab-hint"><summary>Show a hint</summary><p>${escapeHtml(depth.lab.hint)}</p></details>
      </section>` : "";
    const glossary = depth.glossary?.length ? `
      <section class="reader-glossary" id="reader-glossary"><h3>Key terms</h3><dl>${depth.glossary.map(([term, definition]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(definition)}</dd></div>`).join("")}</dl></section>` : "";
    const checkpoints = depth.checkpoints?.length ? `
      <section class="reader-extra-checks" id="reader-extra-checks"><h3>More to check</h3><p>Try to answer each before opening its explanation.</p>
        ${depth.checkpoints.map((item, questionIndex) => `<details class="reader-extra-check"><summary><span>${String(questionIndex + 1).padStart(2, "0")}</span>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join("")}
      </section>` : "";
    const outlineLinks = [
      ...lesson.sections.map((section, sectionIndex) => ({ id: sectionIds[sectionIndex], label: section.heading })),
      ...(workedExample ? [{ id: "reader-worked-example", label: "Worked example" }] : []),
      ...(code ? [{ id: "reader-code", label: lesson.codeTitle || "Runnable code" }] : []),
      ...(lab ? [{ id: "reader-lab", label: depth.lab.title }] : []),
      ...(glossary ? [{ id: "reader-glossary", label: "Key terms" }] : []),
      ...(practiceSteps ? [{ id: "reader-practice", label: "Practice path" }] : []),
      ...(pitfalls ? [{ id: "reader-pitfalls", label: "Common mistakes" }] : []),
      ...(checkpoint ? [{ id: "reader-checkpoint", label: "Self-check" }] : []),
      ...(checkpoints ? [{ id: "reader-extra-checks", label: "More questions" }] : [])
    ];
    const outline = outlineLinks.length > 4 ? `
      <details class="reader-outline"><summary>On this page <span>${lesson.sections.length} reading sections</span></summary>
        <nav aria-label="Lesson contents"><ol>${outlineLinks.map((link) => `<li><a href="#${link.id}" data-scroll-to="${link.id}">${escapeHtml(link.label)}</a></li>`).join("")}</ol></nav>
      </details>` : "";
    const resources = lesson.resources?.length ? `
      <div class="reader-resources"><h3>Go deeper</h3>${lesson.resources.map((resource) => {
        const external = /^https:\/\//i.test(resource.url);
        return `<a href="${escapeHtml(resource.url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(resource.label)} <span aria-hidden="true">↗</span></a>`;
      }).join("")}</div>` : "";

    reader.innerHTML = `
      <div class="reader-topline"><span>${escapeHtml(lesson.number)} / ${escapeHtml(lesson.label)} / ${escapeHtml(lesson.time)}</span><button type="button" data-action="close">Close module</button></div>
      <h2 class="reader-title">${escapeHtml(lesson.title)}</h2>
      <p class="reader-summary">${escapeHtml(lesson.summary)}</p>
      <div class="reader-layout"><div class="reader-prose">${outline}${prerequisites}${sections}${workedExample}${code}${pitfalls}
        <section class="reader-practice-guide" id="reader-practice"><h3>Practice path</h3><p>Build confidence in stages. Keep your result and explain why it works.</p><ol>${depth.practiceSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></section>
        ${lab}${glossary}${checkpoint}${checkpoints}<section class="reader-exercise"><h3>Your turn</h3><p>${escapeHtml(lesson.exercise)}</p></section></div>
      <aside class="reader-aside"><h3>At a glance</h3><p class="reader-aside-stats">${lesson.sections.length} reading sections<br>${depth.practiceSteps.length} practice steps${depth.checkpoints?.length ? `<br>${depth.checkpoints.length + 1} self-checks` : ""}</p><h3 class="reader-focus-heading">Core ideas</h3><ul>${lesson.focus.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><div class="reader-takeaway"><span>Keep in mind</span><p>${escapeHtml(lesson.takeaway)}</p></div>${resources}</aside></div>
      <div class="reader-actions"><button class="button button-primary" type="button" data-action="complete" aria-pressed="false">Mark complete</button>${compilerAction}<button class="button button-secondary" type="button" data-action="next">Next: ${escapeHtml(next.title)}</button></div>`;
    reader.hidden = false;
    updateProgress();
  }

  function openLesson(id, scroll = true) {
    const lesson = lessons.find((item) => item.id === id);
    if (!lesson) return;
    activeLessonId = lesson.id;
    renderLesson(lesson);
    history.replaceState(null, "", `#lesson-${lesson.id}`);
    if (scroll) {
      const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
      reader.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      setTimeout(() => reader.focus({ preventScroll: true }), reduceMotion ? 0 : 180);
    }
  }

  function closeLesson() {
    const previous = activeLessonId;
    reader.hidden = true;
    activeLessonId = null;
    history.replaceState(null, "", "#course");
    const card = previous && [...grid.querySelectorAll(".lesson-card")].find((item) => item.dataset.lessonId === previous);
    (card || document.getElementById("course-title")).focus({ preventScroll: true });
  }

  search.addEventListener("input", renderList);
  grid.addEventListener("click", (event) => {
    const card = event.target.closest(".lesson-card");
    if (card) openLesson(card.dataset.lessonId);
  });
  document.getElementById("continue-learning").addEventListener("click", () => openLesson(nextLesson().id));

  reader.addEventListener("click", async (event) => {
    const scrollLink = event.target.closest("[data-scroll-to]");
    if (scrollLink) {
      event.preventDefault();
      const target = reader.querySelector(`#${CSS.escape(scrollLink.dataset.scrollTo)}`);
      target?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      target?.querySelector("h3")?.focus({ preventScroll: true });
      return;
    }
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "close") closeLesson();
    if (action === "next") {
      const index = lessons.findIndex((lesson) => lesson.id === activeLessonId);
      openLesson(lessons[(index + 1) % lessons.length].id);
    }
    if (action === "complete") {
      completed.has(activeLessonId) ? completed.delete(activeLessonId) : completed.add(activeLessonId);
      saveProgress();
      updateProgress();
      renderList();
    }
    if (action === "copy") {
      const lesson = lessons.find((item) => item.id === activeLessonId);
      const button = event.target.closest("[data-action='copy']");
      try {
        await navigator.clipboard.writeText(lesson.code);
        button.textContent = "Copied";
      } catch {
        button.textContent = "Select and copy";
      }
      setTimeout(() => { if (button.isConnected) button.textContent = "Copy"; }, 1600);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) {
      event.preventDefault();
      search.focus();
    }
  });

  renderFilters();
  const requestedTrack = new URLSearchParams(location.search).get("track");
  if (tracks.some((track) => track.id === requestedTrack)) {
    filters.find((button) => button.dataset.filter === requestedTrack)?.click();
  } else {
    renderList();
  }
  const hash = location.hash.match(/^#lesson-(.+)$/);
  if (hash) openLesson(decodeURIComponent(hash[1]), false);
})();
