"use strict";

(() => {
  const count = document.getElementById("home-module-count");
  if (!count) return;
  count.textContent = `${(window.OFFSET_LESSONS || []).length} study modules`;
})();
