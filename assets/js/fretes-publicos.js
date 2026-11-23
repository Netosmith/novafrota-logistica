/* Nova Frota | consulta pública de fretes autorizados no Portal Frete.
   Sem sessão, sem cookie, sem acesso a dados internos ou de outras transportadoras. */
(() => {
  "use strict";
  const API = "https://api.portalfrete.net.br/v1/driver-freights";
  const $ = (id) => document.getElementById(id);
  const grid = $("fretes-lista");
  if (!grid) return;

  const fields = {
    busca: $("fretes-busca"),
    base: $("fretes-base"),
    produto: $("fretes-produto"),
    eixos: $("fretes-eixos"),
    total: $("fretes-total"),
    go: $("fretes-base-go"),
    mt: $("fretes-base-mt"),
    update: $("fretes-atualizado"),
    summary: $("fretes-resumo"),
    refresh: $("fretes-atualizar"),
    clear: $("fretes-limpar")
  };
  const labelSource = (value) =>
    value === "fretes2" ? "Base MT" : "Base GO / MG / SP";
  const safe = (value, max = 160) => String(value ?? "").trim().slice(0, max);
  const compact = (value) => safe(value).normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const node = (tag, className, label) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (label !== undefined) el.textContent = String(label);
    return el;
  };
  let rows = [];
  let firstLoad = true;
  let loading = false;

  function showMessage(title, description, kind) {
    grid.replaceChildren();
    const box = node("div", "nf-public-state nf-public-state-" + kind);
    box.append(node("span", "nf-public-state-mark", kind === "error" ? "!" : "↗"));
    box.append(node("h3", "", title));
    box.append(node("p", "", description));
    grid.append(box);
  }

  const formatStamp = (value) => {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "";
    return date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  function validWhatsApp(value) {
    const digits = safe(value, 25).replace(/\D/g, "");
    return /^55\d{10,11}$/.test(digits) ? digits : "";
  }

  function normalized(rowsInput) {
    if (!Array.isArray(rowsInput)) throw new Error("Formato de resposta não reconhecido.");
    return rowsInput.filter((row) => {
      if (!row || typeof row !== "object") return false;
      if (!["fretes", "fretes2"].includes(row.source)) return false;
      if (!safe(row.origem) || !safe(row.destino)) return false;
      const expiration = Date.parse(safe(row.expiresAt, 50));
      return Number.isFinite(expiration) && expiration > Date.now();
    }).map((row) => ({
      source: row.source,
      sourceId: safe(row.sourceId, 150),
      origem: safe(row.origem), destino: safe(row.destino),
      coleta: safe(row.coleta), descarga: safe(row.descarga),
      produto: safe(row.produto, 100),
      volume: safe(row.volume, 55),
      valorMotorista: safe(row.valorMotorista, 55),
      whatsapp: validWhatsApp(row.whatsappEmbarcador),
      publishedAt: safe(row.publishedAt, 50),
      expiresAt: safe(row.expiresAt, 50),
      e4: safe(row.e4, 3).toUpperCase(),
      e5: safe(row.e5, 3).toUpperCase(),
      e6: safe(row.e6, 3).toUpperCase(),
      e7: safe(row.e7, 3).toUpperCase(),
      e9: safe(row.e9, 3).toUpperCase()
    }));
  }

  function productOptions() {
    const previous = fields.produto.value;
    const products = [...new Set(rows.map((r) => r.produto).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
    fields.produto.replaceChildren(new Option("Todos os produtos", ""));
    products.forEach((product) => fields.produto.add(new Option(product, product)));
    if (products.includes(previous)) fields.produto.value = previous;
  }

  const field = (label, value) => {
    const box = node("div", "nf-freight-field");
    box.append(node("span", "", label));
    box.append(node("strong", "", value || "Consultar"));
    return box;
  };

  function buildCard(row) {
    const article = node("article", "nf-freight-card");
    const top = node("div", "nf-freight-card-top");
    top.append(node("span", "nf-freight-origin-label", labelSource(row.source)));
    top.append(node("span", "nf-freight-live-status", "● Divulgação ativa"));
    article.append(top);

    const route = node("div", "nf-freight-route");
    const origin = node("div", "nf-freight-route-point");
    origin.append(node("small", "", "ORIGEM"));
    origin.append(node("strong", "", row.origem));
    const arrow = node("span", "nf-freight-arrow", "→");
    arrow.setAttribute("aria-hidden", "true");
    const destination = node("div", "nf-freight-route-point");
    destination.append(node("small", "", "DESTINO"));
    destination.append(node("strong", "", row.destino));
    route.append(origin, arrow, destination);
    article.append(route);

    const info = node("div", "nf-freight-info");
    info.append(field("PRODUTO", row.produto));
    info.append(field("VOLUME", row.volume));
    info.append(field("COLETA", row.coleta));
    info.append(field("DESCARGA", row.descarga));
    if (row.valorMotorista) info.append(field("VALOR MOTORISTA", row.valorMotorista));
    article.append(info);

    const axle = [4, 5, 6, 7, 9].filter((n) => row["e" + n] === "S");
    if (axle.length) {
      const axleBar = node("div", "nf-freight-axles");
      axleBar.append(node("span", "", "TIPOS ACEITOS"));
      axle.forEach((n) => axleBar.append(node("span", "nf-freight-axle-pill", n + "E")));
      article.append(axleBar);
    }

    const bottom = node("div", "nf-freight-card-bottom");
    const time = node("span", "nf-freight-published", "Publicado: " + (formatStamp(row.publishedAt) || "recentemente"));
    bottom.append(time);
    if (row.whatsapp) {
      const link = node("a", "nf-freight-contact", "Falar com o embarcador ↗");
      link.href = "https://wa.me/" + row.whatsapp + "?text=" + encodeURIComponent(
        "Olá! Vi o frete " + row.origem + " → " + row.destino +
        " (" + (row.produto || "carga") + ") no site da Nova Frota. Gostaria de mais informações."
      );
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", "Consultar o frete de " + row.origem + " para " + row.destino + " pelo WhatsApp");
      bottom.append(link);
    } else {
      const hint = node("span", "nf-freight-published", "Contato indisponível");
      bottom.append(hint);
    }
    article.append(bottom);
    return article;
  }

  function render() {
    const search = compact(fields.busca.value);
    const source = fields.base.value;
    const product = fields.produto.value;
    const axle = fields.eixos.value;
    const items = rows.filter((r) =>
      (!source || r.source === source) &&
      (!product || r.produto === product) &&
      (!axle || r[axle] === "S") &&
      (!search || compact([r.origem, r.destino, r.coleta, r.descarga, r.produto].join(" ")).includes(search))
    );
    fields.total.textContent = String(rows.length);
    fields.go.textContent = String(rows.filter((r) => r.source === "fretes").length);
    fields.mt.textContent = String(rows.filter((r) => r.source === "fretes2").length);
    fields.summary.textContent = rows.length
      ? (items.length === 1 ? "1 frete encontrado" : items.length + " fretes encontrados") +
        " de " + rows.length + " anúncios públicos."
      : "Nenhum anúncio público ativo neste momento.";

    grid.replaceChildren();
    if (!rows.length) {
      showMessage("Nenhum frete divulgado agora", "Novas oportunidades aparecerão aqui quando a operação publicar fretes para motoristas no Portal Frete. Os anúncios têm prazo máximo de 72 horas.", "empty");
      return;
    }
    if (!items.length) {
      showMessage("Nenhum frete com estes filtros", "Tente outro destino, produto ou configuração de veículo.", "empty");
      return;
    }
    items.forEach((r) => grid.append(buildCard(r)));
  }

  async function refresh() {
    if (loading) return;
    loading = true;
    fields.refresh.disabled = true;
    fields.refresh.textContent = "Atualizando...";
    if (firstLoad) showMessage("Consultando fretes divulgados", "Buscando as oportunidades publicadas pela equipe Nova Frota.", "loading");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      let response;
      try {
        response = await fetch(API, {
          method: "GET", credentials: "omit", cache: "no-store", mode: "cors",
          headers: { "Accept": "application/json" }, signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }
      if (!response.ok) throw new Error("Serviço temporariamente indisponível.");
      const data = await response.json();
      if (!data || data.ok !== true) throw new Error("Resposta inválida do catálogo.");
      rows = normalized(data.fretes);
      productOptions();
      fields.update.textContent = "Atualizado às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      render();
    } catch (error) {
      // Nunca inventar fretes ou exibir 0 como se o catálogo tivesse sido consultado.
      rows = [];
      fields.total.textContent = "—";
      fields.go.textContent = "—";
      fields.mt.textContent = "—";
      fields.update.textContent = "Conexão indisponível";
      fields.summary.textContent = "Não foi possível verificar os anúncios agora.";
      showMessage("Consulta temporariamente indisponível", "Não foi possível conectar ao catálogo público do Portal Frete. Tente atualizar novamente. Nenhum frete interno será exibido.", "error");
      console.warn("[NOVA FROTA] Falha ao consultar fretes públicos:", error);
    } finally {
      firstLoad = false;
      loading = false;
      fields.refresh.disabled = false;
      fields.refresh.textContent = "↻ Atualizar ofertas";
    }
  }

  [fields.busca, fields.base, fields.produto, fields.eixos].forEach((input) => {
    input.addEventListener(input === fields.busca ? "input" : "change", render);
  });
  fields.clear.addEventListener("click", () => {
    fields.busca.value = "";
    fields.base.value = "";
    fields.produto.value = "";
    fields.eixos.value = "";
    render();
  });
  fields.refresh.addEventListener("click", refresh);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !loading) refresh();
  });
  refresh();
  setInterval(() => { if (!document.hidden) refresh(); }, 120000);
})();
