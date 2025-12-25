let allCardsData = [];

document.addEventListener("DOMContentLoaded", () => {
  init().catch(err => console.error("Erro geral:", err));
});

/* =========================
   MAPA DE ÍCONES
========================= */
const icons = {
  email: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
  dns: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`,
  server: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1v-3.25M7 11h10a2 2 0 012 2v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4a2 2 0 012-2zM4 5h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z"/></svg>`
};

const getIcon = name => icons[name] || icons.email;

/* =========================
   INIT
========================= */
async function init() {
  carregarCards();
  const tutoriais = await carregarTutoriais();

  initModal(tutoriais);
  initBusca();
  initFiltros();
  initVoltarTopo();
  abrirModalPorURL(tutoriais);

  currentPage = 1;
  applyPagination();
}

/* =========================
   CARDS
========================= */
async function carregarCards() {
  const res = await fetch("cards.json");
  const cards = await res.json();

  console.log("Cards carregados:", cards);

  allCardsData = cards;

  const container = document.getElementById("tutorial-list");
  container.innerHTML = "";

  cards.forEach(c => {
    const el = document.createElement("article");
    el.className = `tutorial-card ${c.borderClass}`;
    el.dataset.category = c.category;

    el.innerHTML = `
      <div class="card-header ${c.borderClass}">
        ${getIcon(c.icon)}
        <span>${c.headerText}</span>
      </div>
      <h3 class="card-title">${c.title}</h3>
      <p class="card-description">${c.description}</p>
      <a href="#" class="card-link" data-id="${c.id}">
        ${c.linkText}
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </a>
    `;

    container.appendChild(el);
  });
}

/* =========================
   TUTORIAIS
========================= */
async function carregarTutoriais() {
  const res = await fetch("tutoriais.json");
  return await res.json();
}

/* =========================
   MODAL
========================= */
function initModal(tutoriais) {
  const modal = document.getElementById("tutorialModal");
  const title = document.getElementById("modal_title");
  const desc = document.getElementById("modal_description");
  const body = document.getElementById("modal_body");
  const close = document.querySelector(".close");

  document.querySelectorAll(".card-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();

      const id = link.dataset.id;
      const tutorial = tutoriais.tutoriais.find(t => t.id === id);
      if (!tutorial) return;

      let html = "";

      tutorial.conteudo?.forEach(item => {
        if (item.tipo === "texto") html += `<p>${item.valor}</p>`;
        if (item.tipo === "lista") html += `${item.valor}`;
        if (item.tipo === "imagem") html += `<img src="${item.valor}" style="max-width:100%">`;
      });

      if (tutorial.video) {
        html += `<iframe src="${tutorial.video}" allowfullscreen loading="lazy"></iframe>`;
      }

      title.innerText = tutorial.titulo;
      desc.innerHTML = tutorial.descricao;
      body.innerHTML = html;

      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  close.onclick = () => fecharModal(modal, body);
  window.onclick = e => e.target === modal && fecharModal(modal, body);
}

function fecharModal(modal, body) {
  modal.style.display = "none";
  body.innerHTML = "";
  document.body.style.overflow = "auto";
}

/* =========================
   BUSCA
========================= */

function initBusca() {
  const input = document.getElementById("search");
  if (!input) return;

  const filtrar = () => {
    const value = input.value.toLowerCase();

    document.querySelectorAll(".tutorial-card").forEach(card => {
      card.classList.toggle(
        "hidden-card",
        !card.textContent.toLowerCase().includes(value)
      );
    });

    currentPage = 1;
    applyPagination();
  };

  const filtrarComDelay = debounce(filtrar, 400);

  input.addEventListener("input", filtrarComDelay);
}

/*
function initBusca() {
  const input = document.getElementById("search");
  if (!input) return;

  input.addEventListener("input", () => {
    const value = input.value.toLowerCase();
    document.querySelectorAll(".tutorial-card").forEach(card => {
      card.classList.toggle("hidden-card", !card.textContent.toLowerCase().includes(value));
    });

    currentPage = 1;
    applyPagination();

  });
}
*/
/* =========================
   DEBOUNCE
========================= */

function debounce(fn, delay = 200) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}


/* =========================
   FILTROS
========================= */
function initFiltros() {
  const buttons = document.querySelectorAll(".chip");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const cat = btn.dataset.category;
      document.querySelectorAll(".tutorial-card").forEach(card => {
        card.classList.toggle(
          "hidden-card",
          cat !== "todos" && card.dataset.category !== cat
        );
      });
      currentPage = 1;
      applyPagination();
    });
  });
}

/* =========================
   URL AUTO-OPEN
========================= */
function abrirModalPorURL() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  const link = document.querySelector(`[data-id="${id}"]`);
  if (link) link.click();
}

/* =========================
   VOLTAR AO TOPO
========================= */
function initVoltarTopo() {
  const btn = document.getElementById("voltarTopo");
  if (!btn) return;

  btn.addEventListener("click", e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const CARDS_PER_PAGE = 3;
let currentPage = 1;

function getVisibleCards() {
  return Array.from(document.querySelectorAll(".tutorial-card"))
    .filter(card => !card.classList.contains("hidden-card"));
}

function renderPagination() {
  const pagination = document.getElementById("div-buttons");
  if (!pagination) return;

  // IMPORTANTE: Calcular páginas baseado nos cards filtrados, não no array total
  const visibleCardsCount = getVisibleCards().length;
  const totalPages = Math.ceil(visibleCardsCount / CARDS_PER_PAGE);

  pagination.innerHTML = "";

  

  // Se não houver cards ou apenas 1 página, limpa e retorna
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = i === currentPage ? "pagg active" : "pagg";
    btn.innerText = i;

    btn.onclick = () => {
      currentPage = i;
      applyPagination();

    };

    pagination.appendChild(btn);
  }
}

function applyPagination() {
  const allCards = document.querySelectorAll(".tutorial-card");
  const visibleCards = getVisibleCards();

  // 1. Primeiro, garantimos que cards filtrados (hidden-card) nunca apareçam
  // e resetamos o display dos outros
  allCards.forEach(card => {
    if (card.classList.contains("hidden-card")) {
      card.style.display = "none";
    } else {
      card.style.display = ""; 
    }
  });

  // 2. Aplicar a lógica de fatiamento (slice) apenas nos que estão visíveis
  const start = (currentPage - 1) * CARDS_PER_PAGE;
  const end = start + CARDS_PER_PAGE;

  visibleCards.forEach((card, index) => {
    if (index < start || index >= end) {
      card.style.display = "none";
    }
  });

  renderPagination();
}