"use strict";

(() => {
  window.OFFSET_DEEP_LESSONS = window.OFFSET_DEEP_LESSONS || {};

  window.OFFSET_LESSON_DEPTH = (prerequisites, sections, pitfalls, checkpoint, practiceSteps, options = {}) => ({
    prerequisites,
    sections: sections.map(([heading, text]) => ({ heading, paragraphs: [text] })),
    pitfalls,
    checkpoint,
    practiceSteps,
    time: options.time || "20–30 MIN",
    ...(options.code ? { code: options.code, codeTitle: options.codeTitle } : {})
  });

  window.OFFSET_REGISTER_DEPTH = (entries) => {
    Object.assign(window.OFFSET_DEEP_LESSONS, entries);
    for (const lesson of window.OFFSET_LESSONS || []) {
      const depth = entries[lesson.id];
      if (!depth) continue;
      lesson.depth = depth;
      if (depth.code && !lesson.code) {
        lesson.code = depth.code;
        lesson.codeTitle = depth.codeTitle;
      }
    }
  };

  window.OFFSET_EXPAND_LESSONS = (entries) => {
    for (const [id, addition] of Object.entries(entries)) {
      const depth = window.OFFSET_DEEP_LESSONS[id];
      if (!depth) {
        console.warn(`No base lesson found for expansion: ${id}`);
        continue;
      }

      depth.sections.push(...(addition.sections || []).map(([heading, ...paragraphs]) => ({
        heading,
        paragraphs
      })));
      depth.practiceSteps.push(...(addition.practice || []));
      depth.glossary = addition.glossary || depth.glossary || [];
      depth.workedExample = addition.workedExample || depth.workedExample || null;
      depth.lab = addition.lab || depth.lab || null;
      depth.checkpoints = addition.checkpoints || depth.checkpoints || [];
      depth.time = addition.time || "35–50 MIN";
    }
  };
})();
