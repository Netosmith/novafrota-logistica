/* Nova Frota | Cabeçalho em vidro sobre a hero, somente na Home. */
(() => {
  "use strict";
  if (!document.body.classList.contains("nf-home-v4")) return;
  const header = document.querySelector("body > .site-header");
  const hero = document.querySelector(".nf-hero-v4");
  if (!header || !hero) return;

  const menu = header.querySelector(".menu-area");
  let previousHeight = 0;
  let scheduled = false;

  function syncHeight() {
    // O dropdown móvel fica em overlay e não deve mover o banner.
    if (menu && menu.classList.contains("is-open")) return;
    const next = Math.ceil(header.getBoundingClientRect().height);
    if (next > 40 && next !== previousHeight) {
      previousHeight = next;
      document.body.style.setProperty("--nf-glass-header-height", next + "px");
    }
  }

  function syncScrollState() {
    const heroBottom = hero.getBoundingClientRect().bottom;
    const headerBottom = header.getBoundingClientRect().bottom;
    const solid = heroBottom < headerBottom + 24;
    header.classList.toggle("nf-header-solid", solid);
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      syncHeight();
      syncScrollState();
    });
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(schedule);
    observer.observe(header);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedule).catch(() => {});
  }
  schedule();
})();