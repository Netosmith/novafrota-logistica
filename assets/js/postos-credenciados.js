/* Nova Frota | catálogo público dos postos conveniados.
   Estabelecimentos só aparecem após cadastro explícito em data/postos-credenciados.json. */
(() => {
  "use strict";
  const DATA = "assets/data/postos-credenciados.json";
  const $ = (id) => document.getElementById(id);
  const grid = $("postos-lista");
  if (!grid) return;
  const ui = {
    search: $("postos-busca"), state: $("postos-uf"), service: $("postos-servico"),
    total: $("postos-total"), ufs: $("postos-estados"), result: $("postos-resumo"),
    status: $("postos-atualizado"), clear: $("postos-limpar")
  };
  const text = (value, max = 180) => String(value ?? "").trim().slice(0, max);
  const normalized = (s) => text(s, 600).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };
  const validPhone = (raw) => {
    const digits = text(raw, 30).replace(/\D/g, "");
    return /^55\d{10,11}$/.test(digits) ? digits : "";
  };
  const validMap = (raw) => {
    const value = text(raw, 1000);
    if (!value) return "";
    try {
      const url = new URL(value);
      const hostname = url.hostname.toLowerCase();
      if (url.protocol !== "https:") return "";
      const trusted = ["maps.google.com", "www.google.com", "google.com",
        "maps.app.goo.gl", "www.waze.com", "waze.com"];
      return trusted.includes(hostname) ? url.href : "";
    } catch {
      return "";
    }
  };

  let stations = [];
  function showState(title, description, kind) {
    grid.replaceChildren();
    const el = node("div", "nf-public-state nf-public-state-" + kind);
    el.append(node("span", "nf-public-state-mark", "⌖"));
    el.append(node("h3", "", title));
    el.append(node("p", "", description));
    if (kind === "empty") {
      const a = node("a", "nf-public-state-link", "Solicitar informações →");
      a.href = "contato.html";
      el.append(a);
    }
    grid.append(el);
  }

  function card(p) {
    const article = node("article", "nf-station-card");
    const header = node("div", "nf-station-card-head");
    header.append(node("span", "nf-station-icon", "⌖"));
    const status = node("span", "nf-station-badge", "Posto credenciado");
    header.append(status);
    article.append(header);
    article.append(node("h3", "", p.nome));
    const loc = [p.cidade, p.uf].filter(Boolean).join(" / ");
    article.append(node("p", "nf-station-city", loc || "Localização a consultar"));
    const info = node("div", "nf-station-fields");
    if (p.rodovia) {
      const it = node("div", "");
      it.append(node("span", "", "RODOVIA"));
      it.append(node("strong", "", p.rodovia + (p.km ? " · km " + p.km : "")));
      info.append(it);
    }
    if (p.endereco) {
      const it = node("div", "");
      it.append(node("span", "", "ENDEREÇO"));
      it.append(node("strong", "", p.endereco));
      info.append(it);
    }
    if (p.horario) {
      const it = node("div", "");
      it.append(node("span", "", "ATENDIMENTO"));
      it.append(node("strong", "", p.horario));
      info.append(it);
    }
    article.append(info);
    if (p.servicos.length) {
      const services = node("div", "nf-station-services");
      p.servicos.forEach((s) => services.append(node("span", "", s)));
      article.append(services);
    }
    const buttons = node("div", "nf-station-actions");
    const map = validMap(p.mapa);
    if (map) {
      const a = node("a", "nf-station-map", "Ver localização ↗");
      a.href = map; a.target = "_blank"; a.rel = "noopener noreferrer";
      buttons.append(a);
    }
    const phone = validPhone(p.whatsapp);
    if (phone) {
      const a = node("a", "nf-station-contact", "Falar com o posto ↗");
      a.href = "https://wa.me/" + phone; a.target = "_blank"; a.rel = "noopener noreferrer";
      buttons.append(a);
    }
    if (buttons.children.length) article.append(buttons);
    return article;
  }

  function render() {
    const search = normalized(ui.search.value);
    const uf = ui.state.value;
    const service = ui.service.value;
    const found = stations.filter((p) =>
      (!uf || p.uf === uf) &&
      (!service || p.servicos.includes(service)) &&
      (!search || normalized([p.nome, p.cidade, p.uf, p.rodovia, p.endereco, ...p.servicos].join(" ")).includes(search))
    );
    ui.total.textContent = String(stations.length);
    ui.ufs.textContent = String(new Set(stations.map((p) => p.uf).filter(Boolean)).size);
    ui.result.textContent = stations.length
      ? found.length + (found.length === 1 ? " posto encontrado" : " postos encontrados")
      : "Aguardando divulgação de postos credenciados.";
    grid.replaceChildren();
    if (!stations.length) {
      showState("Postos em preparação", "Ainda não há estabelecimentos confirmados para divulgação nesta página. A Nova Frota publicará os postos após validação da rede credenciada.", "empty");
    } else if (!found.length) {
      showState("Nenhum posto com estes filtros", "Altere a cidade, o estado ou o serviço para ampliar a busca.", "empty");
    } else {
      found.forEach((p) => grid.append(card(p)));
    }
  }

  const addOptions = (select, label, items) => {
    const previous = select.value;
    select.replaceChildren(new Option(label, ""));
    items.forEach((s) => select.add(new Option(s, s)));
    if (items.includes(previous)) select.value = previous;
  };

  async function load() {
    showState("Consultando a rede", "Carregando os estabelecimentos credenciados divulgados pela Nova Frota.", "loading");
    try {
      const response = await fetch(DATA, { cache: "no-store" });
      if (!response.ok) throw new Error("Não foi possível consultar o cadastro.");
      const data = await response.json();
      if (!data || !Array.isArray(data.postos)) throw new Error("Formato inválido.");
      stations = data.postos
        .filter((p) => p && p.ativo === true && text(p.nome) && /^[A-Z]{2}$/.test(text(p.uf).toUpperCase()))
        .map((p) => ({
          nome: text(p.nome, 140), cidade: text(p.cidade, 100),
          uf: text(p.uf, 2).toUpperCase(),
          rodovia: text(p.rodovia, 100), km: text(p.km, 30),
          endereco: text(p.endereco, 180), horario: text(p.horario, 100),
          mapa: text(p.mapa, 1000), whatsapp: text(p.whatsapp, 30),
          servicos: Array.isArray(p.servicos) ? p.servicos.map((s) => text(s, 50)).filter(Boolean).slice(0, 12) : []
        }))
        .sort((a, b) => a.uf.localeCompare(b.uf) || a.cidade.localeCompare(b.cidade) || a.nome.localeCompare(b.nome));
      addOptions(ui.state, "Todos os estados", [...new Set(stations.map((p) => p.uf))].sort());
      addOptions(ui.service, "Todos os serviços", [...new Set(stations.flatMap((p) => p.servicos))].sort((a, b) => a.localeCompare(b, "pt-BR")));
      ui.status.textContent = "Cadastro consultado";
      render();
    } catch (error) {
      stations = [];
      ui.total.textContent = "—";
      ui.ufs.textContent = "—";
      ui.result.textContent = "Não foi possível consultar o cadastro.";
      ui.status.textContent = "Consulta indisponível";
      showState("Consulta temporariamente indisponível", "Não foi possível consultar a relação de postos agora. Tente novamente mais tarde.", "error");
      console.warn("[NOVA FROTA] Postos indisponíveis:", error);
    }
  }

  ui.search.addEventListener("input", render);
  ui.state.addEventListener("change", render);
  ui.service.addEventListener("change", render);
  ui.clear.addEventListener("click", () => {
    ui.search.value = ""; ui.state.value = ""; ui.service.value = "";
    render();
  });
  load();
})();
