/* Nova Frota | abertura cinematográfica da Home.
   A animação não coleta dados; pode ser pulada e não impede acesso ao site. */
(() => {
  "use strict";
  const intro = document.getElementById("nf-site-intro");
  if (!intro) return;
  const skip = document.getElementById("nf-intro-skip");
  const replay = document.querySelector("[data-nf-intro-replay]");
  const hero = document.getElementById("nf-hero-title");
  const KEY = "nf-cinematic-opening-2026-v9-gva";
  const DURATION = 5250;
  const FADE_DURATION = 830;
  const reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let playing = false;
  let finishTimer = null;
  let removalTimer = null;

  function wasSeen() {
    try {
      return window.sessionStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  }

  function markSeen() {
    try {
      window.sessionStorage.setItem(KEY, "1");
    } catch {
      // Navegação e botão para pular permanecem funcionais sem armazenamento.
    }
  }

  function clearTimers() {
    window.clearTimeout(finishTimer);
    window.clearTimeout(removalTimer);
    finishTimer = null;
    removalTimer = null;
  }

  function finish(restoreFocus = false) {
    if (!playing) return;
    playing = false;
    intro.dispatchEvent(new Event("nf-intro-end"));
    clearTimers();
    markSeen();
    intro.classList.add("is-exiting");
    document.body.classList.remove("nf-intro-locked");
    removalTimer = window.setTimeout(() => {
      intro.hidden = true;
      intro.classList.remove("is-exiting", "is-playing");
      if (restoreFocus && hero) {
        hero.setAttribute("tabindex", "-1");
        hero.focus({ preventScroll: true });
      }
    }, FADE_DURATION);
  }

  function play(force = false) {
    if (reducedMotion || (!force && wasSeen())) {
      intro.hidden = true;
      return;
    }
    clearTimers();
    playing = true;
    intro.hidden = false;
    intro.classList.remove("is-exiting", "is-playing");
    document.body.classList.add("nf-intro-locked");
    // Reiniciar os keyframes também ao clicar em "Rever abertura".
    void intro.offsetWidth;
    intro.classList.add("is-playing");
    intro.dispatchEvent(new Event("nf-intro-start"));
    if (skip) skip.focus({ preventScroll: true });
    finishTimer = window.setTimeout(() => finish(false), DURATION);
  }

  if (skip) skip.addEventListener("click", () => finish(true));
  if (replay) replay.addEventListener("click", () => play(true));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && playing) finish(true);
  });
  // Cenário e logo carregados antes da animação. A própria Home já
  // usa este mesmo cenário e aparece durante a dissolução final.
  // Se qualquer recurso falhar, não bloquear a navegação.
  const requiredImages = [
    intro.querySelector(".nf-agro-landscape"),
    intro.querySelector(".nf-agro-logo-image")
  ].filter(Boolean);

  const ready = (image) => new Promise((resolve) => {
    if (image.complete) {
      resolve(image.naturalWidth > 0);
      return;
    }
    image.addEventListener("load", () => resolve(true), { once: true });
    image.addEventListener("error", () => resolve(false), { once: true });
  });

  if (!reducedMotion && !wasSeen()) {
    Promise.all(requiredImages.map(ready)).then((statuses) => {
      if (statuses.every(Boolean)) play();
      else {
        markSeen();
        intro.hidden = true;
        document.body.classList.remove("nf-intro-locked");
      }
    });
  } else {
    intro.hidden = true;
  }
})();
