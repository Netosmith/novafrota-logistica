/* NOVA FROTA | Desintegração e recomposição da marca oficial, 2026
 * 45 fragmentos do arquivo verdadeiro + partículas amostradas da própria logo.
 * Não desenha letras novas e não altera o desenho final da marca.
 */
(() => {
  "use strict";
  const intro = document.getElementById("nf-site-intro");
  const stage = intro && intro.querySelector("[data-nf-logo-stage]");
  const wrapper = intro && intro.querySelector("[data-nf-logo-fragments]");
  const canvas = intro && intro.querySelector("[data-nf-logo-dust]");
  const logo = intro && intro.querySelector(".nf-intro-assembly-logo");
  if (!stage || !wrapper || !canvas || !logo) return;

  const reduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  let seed = 20261123;
  const random = () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // O arquivo oficial fica no fundo de cada recorte. O clip-path
  // preserva os traços, cores, seta e subtítulo da mesma imagem.
  const columns = 15;
  const rows = 3;
  const pieces = document.createDocumentFragment();
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const piece = document.createElement("span");
      piece.className = "nf-intro-assembly-fragment";
      piece.setAttribute("aria-hidden", "true");
      const left = (col / columns) * 100;
      const right = ((col + 1) / columns) * 100;
      const top = (row / rows) * 100;
      const bottom = ((row + 1) / rows) * 100;
      piece.style.clipPath = "polygon(" +
        left.toFixed(5) + "% " + top.toFixed(5) + "%," +
        right.toFixed(5) + "% " + top.toFixed(5) + "%," +
        right.toFixed(5) + "% " + bottom.toFixed(5) + "%," +
        left.toFixed(5) + "% " + bottom.toFixed(5) + "%)";
      const side = (col - (columns - 1) / 2) / ((columns - 1) / 2);
      const dx = (side * 158) + ((random() - .5) * 144);
      const dy = (row - 1) * 74 + ((random() - .5) * 152);
      const rot = (random() - .5) * 42;
      piece.style.setProperty("--nf-dx", dx.toFixed(1) + "px");
      piece.style.setProperty("--nf-dy", dy.toFixed(1) + "px");
      piece.style.setProperty("--nf-rot", rot.toFixed(1) + "deg");
      pieces.append(piece);
    }
  }
  wrapper.append(pieces);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  let particles = [];
  let width = 1;
  let height = 1;
  let rafId = null;
  let startStamp = null;

  function resize() {
    const box = stage.getBoundingClientRect();
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function sampleLogoPixels() {
    if (!logo.complete || !logo.naturalWidth) return;
    const sample = document.createElement("canvas");
    sample.width = 550;
    sample.height = 97;
    const context = sample.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    context.drawImage(logo, 0, 0, sample.width, sample.height);
    let pixels;
    try {
      pixels = context.getImageData(0, 0, sample.width, sample.height).data;
    } catch {
      return;
    }

    const limit = window.innerWidth < 640 ? 420 : 1050;
    const options = [];
    // Pontos reais das letras, do símbolo azul e do subtítulo cinza.
    for (let y = 1; y < sample.height; y += 3) {
      for (let x = 1; x < sample.width; x += 3) {
        const i = (y * sample.width + x) * 4;
        if (pixels[i + 3] < 140) continue;
        options.push({
          px: x / sample.width,
          py: y / sample.height,
          color: [pixels[i], pixels[i + 1], pixels[i + 2]]
        });
      }
    }
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const t = options[i];
      options[i] = options[j];
      options[j] = t;
    }
    particles = options.slice(0, limit).map((item) => {
      const direction = (item.px - .5) * 1.7 + (random() - .5) * 1.4;
      return {
        x: item.px, y: item.py, color: item.color,
        dx: direction * (90 + random() * 125),
        dy: (random() - .5) * 175,
        size: random() < .17 ? 2.6 : 1.5 + random() * .9,
        phase: random() * Math.PI * 2
      };
    });
  }

  const clamp = (x) => Math.max(0, Math.min(1, x));
  const smooth = (x) => {
    const t = clamp(x);
    return t * t * (3 - 2 * t);
  };

  function frame(timestamp) {
    if (startStamp === null) startStamp = timestamp;
    const elapsed = timestamp - startStamp;
    ctx.clearRect(0, 0, width, height);
    if (!intro.classList.contains("is-playing") || intro.hidden) {
      stop();
      return;
    }
    if (elapsed >= 990 && elapsed <= 5750 && particles.length) {
      let spread = 0;
      let opacity = 0;
      if (elapsed < 2800) {
        spread = smooth((elapsed - 990) / 1600);
        opacity = Math.min(1, (elapsed - 990) / 350);
      } else if (elapsed < 3310) {
        spread = 1;
        opacity = .92;
      } else {
        spread = 1 - smooth((elapsed - 3310) / 1800);
        opacity = Math.min(1, (5750 - elapsed) / 650);
      }
      const now = elapsed / 1000;
      const scale = Math.min(1, width / 600);
      for (const p of particles) {
        const wiggle = Math.sin(now * 4 + p.phase) * spread * 8;
        const x = p.x * width + (p.dx + wiggle) * spread * scale;
        const y = p.y * height + p.dy * spread * scale;
        const a = clamp(opacity * (.44 + .56 * (1 - spread * .23)));
        if (a < .012) continue;
        const [r, g, b] = p.color;
        ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a.toFixed(3) + ")";
        ctx.fillRect(x, y, p.size, p.size);
      }
    }
    if (elapsed < 5900) {
      rafId = window.requestAnimationFrame(frame);
    } else {
      rafId = null;
      ctx.clearRect(0, 0, width, height);
    }
  }

  function stop() {
    if (rafId !== null) window.cancelAnimationFrame(rafId);
    rafId = null;
    startStamp = null;
    ctx.clearRect(0, 0, width, height);
  }

  function start() {
    stop();
    resize();
    if (!particles.length) sampleLogoPixels();
    rafId = window.requestAnimationFrame(frame);
  }

  intro.addEventListener("nf-intro-start", start);
  intro.addEventListener("nf-intro-end", stop);
  window.addEventListener("resize", resize, { passive: true });
  if (logo.complete && logo.naturalWidth) sampleLogoPixels();
  else logo.addEventListener("load", sampleLogoPixels, { once: true });
})();
