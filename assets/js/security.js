"use strict";

(() => {
  const lessons = window.OFFSET_LESSONS || [];
  const tracks = window.OFFSET_TRACKS || [];
  for (const id of ["blue-team", "red-team", "osint"]) {
    const track = tracks.find((item) => item.id === id);
    const modules = lessons.filter((lesson) => lesson.track === id);
    const count = document.getElementById(`count-${id}`);
    const list = document.getElementById(`modules-${id}`);
    if (count) count.textContent = `${modules.length} modules`;
    if (!list || !track) continue;
    list.replaceChildren(...modules.slice(0, 3).map((lesson) => {
      const link = document.createElement("a");
      link.href = `./learn.html?track=${encodeURIComponent(id)}#lesson-${encodeURIComponent(lesson.id)}`;
      link.className = "security-module-link";
      link.innerHTML = `<span>${lesson.number}</span><strong>${lesson.title}</strong><b aria-hidden="true">↗</b>`;
      return link;
    }));
  }
})();
