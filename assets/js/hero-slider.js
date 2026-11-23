/* Nova Frota: slider do banner institucional
   Imagens próprias do repositório. Respeita foco, visibilidade e movimento reduzido. */
(() => {
  "use strict";
  const hero = document.querySelector(".nf-hero-v4");
  if (!hero) return;
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-goto]"));
  const counter = hero.querySelector("[data-hero-counter]");
  const previous = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  const pauseButton = hero.querySelector("[data-hero-pause]");
  const intro = document.getElementById("nf-site-intro");
  const reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const INTERVAL = 6000;
  if (slides.length < 2 || dots.length !== slides.length || !previous ||
      !next || !pauseButton || !counter) return;
  let index = 0;
  let timer = null;
  let pausedByUser = false;

  function show(target) {
    index = (target + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
    });
    dots.forEach((dot, i) => {
      const isSelected = i === index;
      dot.classList.toggle("is-active", isSelected);
      if (isSelected) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    counter.textContent = String(index + 1).padStart(2, "0") + " / " +
      String(slides.length).padStart(2, "0");
  }

  function stop() {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  }

  function shouldAutoplay() {
    return !pausedByUser && !reducedMotion && !document.hidden &&
      (!intro || intro.hidden) &&
      !hero.querySelector(".nf-hero-v4-slider-controls").contains(document.activeElement);
  }

  function start() {
    stop();
    if (!shouldAutoplay()) return;
    timer = window.setInterval(() => {
      if (!shouldAutoplay()) {
        stop();
        return;
      }
      show(index + 1);
    }, INTERVAL);
  }

  function navigate(to) {
    show(to);
    start();
  }

  previous.addEventListener("click", () => navigate(index - 1));
  next.addEventListener("click", () => navigate(index + 1));
  dots.forEach((button, i) => button.addEventListener("click", () => navigate(i)));
  pauseButton.addEventListener("click", () => {
    pausedByUser = !pausedByUser;
    pauseButton.setAttribute("aria-pressed", String(pausedByUser));
    pauseButton.setAttribute("aria-label", pausedByUser ? "Retomar troca automática" : "Pausar troca automática");
    pauseButton.innerHTML = pausedByUser ? '▶ <span>Reproduzir</span>' : 'Ⅱ <span>Pausar</span>';
    start();
  });
  const controls = hero.querySelector(".nf-hero-v4-slider-controls");
  controls.addEventListener("mouseenter", stop);
  controls.addEventListener("mouseleave", start);
  controls.addEventListener("focusin", stop);
  controls.addEventListener("focusout", () => window.setTimeout(start, 0));
  document.addEventListener("visibilitychange", start);

  if (reducedMotion) {
    pauseButton.hidden = true;
    pauseButton.setAttribute("aria-label", "Animação automática desativada");
  }

  // A abertura cinematográfica acontece antes do slider; quando
  // a intro é ocultada (ou reapresentada), a reprodução se ajusta.
  if (intro && window.MutationObserver) {
    const observer = new MutationObserver(start);
    observer.observe(intro, { attributes: true, attributeFilter: ["hidden"] });
  }

  show(0);
  start();
})();