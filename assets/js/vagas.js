/* Vagas públicas da Nova Frota. Dados em assets/data/vagas.json.
   Esta interface não armazena currículos ou dados de candidatos. */
(function () {
  "use strict";
  const dataUrl = "assets/data/vagas.json";
  const cards = [...document.querySelectorAll("[data-vagas-list]")];
  const badges = [...document.querySelectorAll("[data-vagas-count]")];

  const node = (tag, cls, content) => {
    const element = document.createElement(tag);
    if (cls) element.className = cls;
    if (content !== undefined) element.textContent = String(content);
    return element;
  };

  const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

  const contactLink = (job) => {
    const contact = job.contato && typeof job.contato === "object" ? job.contato : {};
    const type = String(contact.tipo || "").toLowerCase();
    const value = String(contact.valor || "").trim();
    const title = String(job.titulo || "vaga").trim();
    if (type === "whatsapp") {
      const phone = value.replace(/\D/g, "");
      if (phone.length >= 12 && phone.length <= 15) {
        return "https://wa.me/" + phone + "?text=" + encodeURIComponent("Olá! Tenho interesse na vaga: " + title + ". Como envio meu currículo?");
      }
    }
    if (type === "email" && validEmail(value)) {
      return "mailto:" + value + "?subject=" + encodeURIComponent("Candidatura: " + title);
    }
    if (type === "link" && /^https:\/\//i.test(value)) {
      return value;
    }
    return "trabalhe-conosco.html#candidatura";
  };

  const emptyState = () => {
    const wrapper = node("div", "nf-job-empty");
    wrapper.append(node("span", "nf-job-empty-icon", "✳"));
    wrapper.append(node("h3", "", "Nenhuma vaga anunciada no momento"));
    wrapper.append(node("p", "", "Ainda não temos oportunidades publicadas nesta página. Você pode conhecer o canal de contato e acompanhar futuras atualizações."));
    const link = node("a", "nf-job-contact", "Saiba como se candidatar →");
    link.href = "trabalhe-conosco.html#candidatura";
    wrapper.append(link);
    return wrapper;
  };

  const jobCard = (job) => {
    const item = node("article", "nf-vacancy");
    const top = node("div", "nf-vacancy-meta");
    top.append(node("span", "nf-vacancy-status", "Vaga aberta"));
    const place = [job.cidade, job.uf].map(s => String(s || "").trim()).filter(Boolean).join(" / ");
    if (place) top.append(node("span", "", place));
    item.append(top);
    item.append(node("h3", "nf-vacancy-title", job.titulo));
    if (job.modalidade) item.append(node("p", "nf-vacancy-type", String(job.modalidade)));
    if (job.resumo) item.append(node("p", "nf-vacancy-summary", String(job.resumo)));
    if (Array.isArray(job.requisitos) && job.requisitos.length) {
      const details = node("ul", "nf-vacancy-requirements");
      job.requisitos.slice(0, 4).forEach((req) => details.append(node("li", "", String(req))));
      item.append(details);
    }
    const link = node("a", "nf-job-contact", "Como me candidatar →");
    link.href = contactLink(job);
    if (link.href.startsWith("https://")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    item.append(link);
    return item;
  };

  async function loadVacancies() {
    try {
      const response = await fetch(dataUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Não foi possível obter a lista.");
      const data = await response.json();
      if (!data || !Array.isArray(data.vagas)) throw new Error("Formato de vagas inválido.");
      const today = new Date();
      const candidates = data.vagas.filter((job) => {
        if (!job || job.ativo !== true || !String(job.titulo || "").trim()) return false;
        if (!job.data_limite) return true;
        const date = new Date(String(job.data_limite) + "T23:59:59");
        return !Number.isNaN(date.getTime()) && date >= today;
      });
      badges.forEach((label) => {
        label.textContent = candidates.length === 0 ? "Sem anúncios ativos" :
          candidates.length === 1 ? "1 vaga anunciada" : candidates.length + " vagas anunciadas";
      });
      cards.forEach((list) => {
        list.replaceChildren();
        if (!candidates.length) list.append(emptyState());
        else candidates.forEach((job) => list.append(jobCard(job)));
      });
    } catch (error) {
      badges.forEach((label) => label.textContent = "Atualização indisponível");
      cards.forEach((list) => {
        list.replaceChildren();
        list.append(node("p", "nf-job-load-error", "Não foi possível consultar as vagas agora. Consulte novamente mais tarde."));
      });
      console.warn("Nova Frota: vagas indisponíveis.", error);
    }
  }

  const form = document.getElementById("nf-career-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const fields = new FormData(form);
      const name = String(fields.get("nome") || "").trim().slice(0, 100);
      const city = String(fields.get("cidade") || "").trim().slice(0, 100);
      const area = String(fields.get("area") || "").trim().slice(0, 80);
      if (!name || !city || !area) return;
      const text = [
        "Olá! Gostaria de saber como encaminhar meu currículo para a Nova Frota.",
        "Nome: " + name,
        "Cidade/UF: " + city,
        "Área de interesse: " + area,
        "Poderiam informar o canal responsável por recrutamento? Tenho o currículo para anexar."
      ].join("\n");
      const url = "https://wa.me/5564992215878?text=" + encodeURIComponent(text);
      // O clique é iniciado pelo próprio candidato; nenhuma informação é salva no site.
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) window.location.href = url;
    });
  }
  if (cards.length || badges.length) loadVacancies();
})();
