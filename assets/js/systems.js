"use strict";

(() => {
  const root = document.getElementById("systems-curriculum");
  if (!root) return;
  const lessons = window.OFFSET_LESSONS || [];
  const tracks = window.OFFSET_TRACKS || [];

  for (const id of ["lowlevel", "windows"]) {
    const track = tracks.find((item) => item.id === id);
    const modules = lessons.filter((lesson) => lesson.track === id);
    if (!track) continue;
    const section = document.createElement("section");
    section.className = "systems-track-block";
    section.innerHTML = `<div class="systems-track-heading"><div><h2>${track.title}</h2><p>${track.description}</p></div><span>${modules.length} MODULES</span></div>`;
    for (const lesson of modules) {
      const link = document.createElement("a");
      link.className = "systems-row";
      link.href = `./learn.html?track=${encodeURIComponent(id)}#lesson-${encodeURIComponent(lesson.id)}`;
      link.innerHTML = `<span class="systems-row-code">${lesson.number}</span><span><strong>${lesson.title}</strong><small>${lesson.description}</small></span><b aria-hidden="true">↗</b>`;
      section.append(link);
    }
    root.append(section);
  }
})();
