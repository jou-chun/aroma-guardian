(() => {
  "use strict";

  const start = document.querySelector("#seasonalStart");
  const stop = document.querySelector("#seasonalStop");
  const orbit = document.querySelector("#breathOrbit");
  const cue = document.querySelector("#breathCue");
  const timer = document.querySelector("#breathTimer");
  const steps = [...document.querySelectorAll("[data-season-step]")];
  if (!start || !stop || !orbit || !cue || !timer || !steps.length) return;

  let timers = [];
  let running = false;

  function schedule(callback, delay) {
    const id = window.setTimeout(callback, delay);
    timers.push(id);
  }

  function highlight(index) {
    steps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === index));
    steps[index]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function setBreath(text, description) {
    cue.textContent = text;
    timer.textContent = description;
  }

  function finish() {
    running = false;
    orbit.classList.remove("is-running");
    setBreath("完成", "做得很好。保持舒服即可，不需要勉強深呼吸。");
    steps.forEach(step => step.classList.remove("is-active"));
    start.textContent = "再做一次";
    start.disabled = false;
    stop.classList.add("hidden");
  }

  function cancel() {
    timers.forEach(window.clearTimeout);
    timers = [];
    running = false;
    orbit.classList.remove("is-running");
    setBreath("準備", "引導已停止，需要時可以重新開始");
    steps.forEach(step => step.classList.remove("is-active"));
    start.textContent = "開始跟著做";
    start.disabled = false;
    stop.classList.add("hidden");
  }

  function begin() {
    if (running) return;
    cancel();
    running = true;
    start.disabled = true;
    stop.classList.remove("hidden");
    highlight(0);
    setBreath("先選擇", "準備順暢清新複方；擴香加入2～3滴即可");

    schedule(() => {
      highlight(1);
      setBreath("先稀釋", "需要胸前塗抹時，加入尤加利單方並以分餾椰子油稀釋");
    }, 5000);

    schedule(() => {
      highlight(2);
      orbit.classList.add("is-running");
      setBreath("吸氣", "鼻子慢慢吸氣，肩膀保持放鬆");
    }, 11000);

    [15000, 23000, 31000].forEach((at, index) => {
      schedule(() => setBreath("吐氣", `慢慢吐氣 · 第${index + 1}次`), at);
      if (index < 2) schedule(() => setBreath("吸氣", `舒服地吸氣 · 第${index + 2}次`), at + 4000);
    });
    schedule(finish, 35000);
  }

  start.addEventListener("click", begin);
  stop.addEventListener("click", cancel);
})();
