/* Navegação compartilhada das páginas institucionais. */
(function () {
  const menu = document.getElementById("site-menu");
  const toggle = document.querySelector(".menu-toggle");
  if (menu && toggle) {
    const setOpen = (open) => {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    };
    toggle.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }
  // O menu "Mais" usa <details> nativo, com fechamento por clique externo e Esc.
  const extraMenus = [...document.querySelectorAll(".nf-nav-more")];
  document.addEventListener("click", (event) => {
    extraMenus.forEach((details) => {
      if (!details.contains(event.target)) details.open = false;
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") extraMenus.forEach((details) => { details.open = false; });
  });
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav-faithful a").forEach((link) => {
    const isCurrent = link.getAttribute("href") === current;
    link.classList.toggle("active", isCurrent);
    if (isCurrent) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.querySelectorAll("[data-current-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();