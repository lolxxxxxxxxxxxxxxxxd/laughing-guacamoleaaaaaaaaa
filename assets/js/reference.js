"use strict";

(() => {
  const input = document.getElementById("base-input");
  const baseSelect = document.getElementById("base-select");
  if (input && baseSelect) {
    function parseValue(text, base) {
      let raw = text.trim().replaceAll("_", "");
      if (!raw) return null;
      let sign = 1;
      if (raw.startsWith("-")) {
        sign = -1;
        raw = raw.slice(1);
      } else if (raw.startsWith("+")) {
        raw = raw.slice(1);
      }
      if (base === 16) raw = raw.replace(/^0x/i, "");
      if (base === 2) raw = raw.replace(/^0b/i, "");
      const valid = base === 2 ? /^[01]+$/.test(raw) : base === 10 ? /^\d+$/.test(raw) : /^[\da-f]+$/i.test(raw);
      if (!valid) return null;
      const number = Number.parseInt(raw, base) * sign;
      return Number.isSafeInteger(number) ? number : null;
    }

    function format(number, base) {
      const sign = number < 0 ? "-" : "";
      const digits = Math.abs(number).toString(base);
      return base === 16 ? `${sign}0x${digits.toUpperCase()}` : `${sign}${digits}`;
    }

    function updateConverter() {
      const value = parseValue(input.value, Number(baseSelect.value));
      document.getElementById("base-error").hidden = value !== null;
      document.getElementById("base-decimal").textContent = value === null ? "—" : format(value, 10);
      document.getElementById("base-hex").textContent = value === null ? "—" : format(value, 16);
      document.getElementById("base-binary").textContent = value === null ? "—" : format(value, 2);
    }

    input.addEventListener("input", updateConverter);
    baseSelect.addEventListener("change", updateConverter);
    updateConverter();
  }

  const answers = [...document.querySelectorAll("[data-quiz-answer]")];
  const feedback = document.getElementById("quiz-feedback");
  const reset = document.getElementById("quiz-reset");
  if (answers.length && feedback && reset) {
    answers.forEach((button) => button.addEventListener("click", () => {
      const correct = button.dataset.quizAnswer === "cast";
      answers.forEach((answer) => {
        answer.disabled = true;
        answer.classList.toggle("is-correct", answer.dataset.quizAnswer === "cast");
        answer.classList.toggle("is-incorrect", answer === button && !correct);
      });
      feedback.textContent = correct
        ? "Correct. std::move casts to an xvalue. A later operation may use a move constructor or assignment; std::move itself does not move bytes."
        : "Not quite. std::move is a cast to an xvalue. The operation that receives it may move, but std::move itself does not.";
      reset.hidden = false;
    }));

    reset.addEventListener("click", () => {
      answers.forEach((answer) => {
        answer.disabled = false;
        answer.classList.remove("is-correct", "is-incorrect");
      });
      feedback.textContent = "Choose an answer to see the explanation.";
      reset.hidden = true;
      answers[0].focus();
    });
  }
})();
