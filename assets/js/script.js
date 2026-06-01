/* AgroTech Space - JavaScript principal.
   O arquivo detecta a página atual pelo atributo data-page e ativa apenas os módulos necessários. */

const page = document.body.dataset.page;

// Navegação responsiva para telas menores.
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// Animação de entrada para cards da home.
const revealItems = document.querySelectorAll(".reveal");

if (revealItems.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.18 });

  revealItems.forEach((item) => observer.observe(item));
}

// Utilitários compartilhados para dados simulados.
function randomBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function formatTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function classifyRisk(temp, humidity, ndvi) {
  if (temp >= 35 || humidity <= 28 || ndvi <= 0.42) return "high";
  if (temp >= 31 || humidity <= 42 || ndvi <= 0.58) return "medium";
  return "low";
}

function riskLabel(risk) {
  const labels = {
    low: "Baixo risco",
    medium: "Risco moderado",
    high: "Alto risco"
  };

  return labels[risk];
}

// Página de monitoramento: atualiza indicadores e barras de progresso.
function initMonitoringPage() {
  const elements = {
    tempValue: document.querySelector("#tempValue"),
    tempStatus: document.querySelector("#tempStatus"),
    tempBar: document.querySelector("#tempBar"),
    humidityValue: document.querySelector("#humidityValue"),
    humidityStatus: document.querySelector("#humidityStatus"),
    humidityBar: document.querySelector("#humidityBar"),
    ndviValue: document.querySelector("#ndviValue"),
    ndviStatus: document.querySelector("#ndviStatus"),
    ndviBar: document.querySelector("#ndviBar"),
    cropStatus: document.querySelector("#cropStatus"),
    cropSummary: document.querySelector("#cropSummary"),
    riskPill: document.querySelector("#riskPill"),
    telemetryList: document.querySelector("#telemetryList"),
    forecastText: document.querySelector("#forecastText"),
    forceUpdate: document.querySelector("#forceUpdate"),
    syncTime: document.querySelector("#syncTime")
  };

  function updateDashboard() {
    const temp = randomBetween(22, 38);
    const humidity = randomBetween(24, 78);
    const ndvi = Number((Math.random() * 0.46 + 0.42).toFixed(2));
    const risk = classifyRisk(temp, humidity, ndvi);
    elements.syncTime.textContent = formatTime();

    elements.tempValue.textContent = `${temp}°C`;
    elements.tempStatus.textContent = temp >= 34 ? "Temperatura elevada" : temp <= 24 ? "Clima ameno" : "Condição estável";
    elements.tempBar.style.width = `${Math.min(temp * 2.4, 100)}%`;

    elements.humidityValue.textContent = `${humidity}%`;
    elements.humidityStatus.textContent = humidity < 35 ? "Irrigação recomendada" : humidity > 68 ? "Solo com alta umidade" : "Irrigação equilibrada";
    elements.humidityBar.style.width = `${humidity}%`;

    elements.ndviValue.textContent = ndvi.toFixed(2);
    elements.ndviStatus.textContent = ndvi < 0.5 ? "Vegetação em atenção" : ndvi < 0.65 ? "Vegetação moderada" : "Vegetação saudável";
    elements.ndviBar.style.width = `${Math.round(ndvi * 100)}%`;

    elements.cropStatus.textContent = risk === "high" ? "Intervenção necessária" : risk === "medium" ? "Atenção preventiva" : "Operação segura";
    elements.cropSummary.textContent = risk === "high"
      ? "Risco elevado detectado. Priorize inspeção e ajuste de irrigação."
      : risk === "medium"
        ? "Alguns indicadores pedem acompanhamento nas próximas horas."
        : "Risco geral baixo nas próximas horas.";
    elements.riskPill.className = `risk-pill ${risk}`;
    elements.riskPill.textContent = riskLabel(risk);

    elements.forecastText.textContent = risk === "high"
      ? "A recomendação operacional é acionar equipe de campo e revisar o plano de irrigação setorial."
      : risk === "medium"
        ? "A lavoura está estável, mas os dados sugerem reforço no acompanhamento preventivo."
        : "A lavoura apresenta boa estabilidade hídrica. Manter monitoramento preventivo.";

    const telemetry = [
      ["Última leitura orbital", formatTime()],
      ["Cobertura de nuvens", `${randomBetween(4, 38)}%`],
      ["Vento médio", `${randomBetween(8, 24)} km/h`],
      ["Precisão estimada", `${randomBetween(88, 97)}%`]
    ];

    elements.telemetryList.innerHTML = telemetry
      .map(([label, value]) => `<div class="telemetry-item"><span>${label}</span><strong>${value}</strong></div>`)
      .join("");
  }

  updateDashboard();
  elements.forceUpdate.addEventListener("click", updateDashboard);
  setInterval(updateDashboard, 6000);
}

// Página de mapa: setores clicáveis e modal de detalhes da fazenda.
function initMapPage() {
  const sectors = {
    a: { name: "Talhão A1 - Soja", humidity: 58, temp: 27, risk: "Baixo", advice: "Área em equilíbrio. Manter irrigação programada e acompanhar variações de temperatura." },
    b: { name: "Talhão B2 - Milho", humidity: 41, temp: 31, risk: "Moderado", advice: "Umidade em queda. Recomenda-se irrigação leve no fim da tarde." },
    c: { name: "Talhão C3 - Algodão", humidity: 34, temp: 34, risk: "Alto", advice: "Risco de estresse hídrico. Priorizar inspeção e irrigação localizada." },
    d: { name: "Talhão D4 - Cana", humidity: 67, temp: 26, risk: "Baixo", advice: "Setor com boa resposta vegetativa e baixa necessidade de intervenção." },
    e: { name: "Talhão E5 - Área experimental", humidity: 29, temp: 22, risk: "Moderado", advice: "Baixa umidade com queda térmica. Monitorar possibilidade de geada." }
  };

  const buttons = document.querySelectorAll(".farm-sector");
  const name = document.querySelector("#sectorName");
  const humidity = document.querySelector("#sectorHumidity");
  const temp = document.querySelector("#sectorTemp");
  const risk = document.querySelector("#sectorRisk");
  const advice = document.querySelector("#sectorAdvice");
  const modal = document.querySelector("#farmModal");
  const openModal = document.querySelector("#openFarmModal");
  const closeModal = document.querySelector("#closeFarmModal");

  function selectSector(key) {
    const data = sectors[key];
    buttons.forEach((button) => button.classList.toggle("active", button.dataset.sector === key));
    name.textContent = data.name;
    humidity.textContent = `${data.humidity}%`;
    temp.textContent = `${data.temp}°C`;
    risk.textContent = data.risk;
    advice.textContent = data.advice;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => selectSector(button.dataset.sector));
  });

  openModal.addEventListener("click", () => {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  });

  closeModal.addEventListener("click", () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal.click();
  });

  selectSector("a");
}

// Página de alertas: gera notificações simuladas manualmente e automaticamente.
function initAlertsPage() {
  const alertsList = document.querySelector("#alertsList");
  const generateAlert = document.querySelector("#generateAlert");
  const clearAlerts = document.querySelector("#clearAlerts");

  const alertTemplates = [
    { title: "Risco de seca", sector: "Talhão C3", level: "high", action: "Aumentar irrigação localizada nas próximas 2 horas." },
    { title: "Possibilidade de geada", sector: "Talhão E5", level: "medium", action: "Adiar plantio sensível e monitorar queda de temperatura." },
    { title: "Baixa vegetação", sector: "Talhão B2", level: "medium", action: "Verificar nutrição do solo e histórico de irrigação." },
    { title: "Irrigação recomendada", sector: "Talhão A1", level: "low", action: "Executar ciclo curto para manter produtividade." },
    { title: "Temperatura elevada", sector: "Talhão C3", level: "high", action: "Inspecionar estresse térmico e reduzir exposição hídrica." }
  ];

  function createAlert() {
    const alert = alertTemplates[randomBetween(0, alertTemplates.length - 1)];
    const card = document.createElement("article");
    card.className = `alert-card ${alert.level}`;
    card.innerHTML = `
      <div class="alert-icon" aria-hidden="true">
        <svg class="icon small" viewBox="0 0 24 24"><path d="M12 9v4"></path><path d="M12 17h.01"></path><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path></svg>
      </div>
      <div>
        <h3>${alert.title}</h3>
        <p>${alert.sector} • ${alert.action}</p>
      </div>
      <span class="risk-pill ${alert.level}">${riskLabel(alert.level)}</span>
    `;

    alertsList.prepend(card);
  }

  generateAlert.addEventListener("click", createAlert);
  clearAlerts.addEventListener("click", () => {
    alertsList.innerHTML = "";
  });

  createAlert();
  createAlert();
  setInterval(createAlert, 9000);
}

// Página de recomendações: simula saída de uma IA agrícola.
function initRecommendationsPage() {
  const output = document.querySelector("#recommendationOutput");
  const grid = document.querySelector("#recommendationGrid");
  const button = document.querySelector("#generateRecommendation");
  const diagnostic = document.querySelector("#aiDiagnostic");

  const recommendations = [
    { level: "high", title: "Aumentar irrigação no Talhão C3", text: "A umidade está abaixo do ideal e a temperatura elevada aumenta risco de estresse hídrico." },
    { level: "medium", title: "Aplicar fertilizante no Talhão B2", text: "O índice de vegetação moderado indica possível deficiência nutricional na fase atual." },
    { level: "medium", title: "Adiar plantio na área experimental", text: "A previsão simulada indica queda térmica e risco de geada nas próximas horas." },
    { level: "low", title: "Realizar inspeção preventiva", text: "Os indicadores estão estáveis, mas uma vistoria reduz incertezas nos setores recém-irrigados." },
    { level: "low", title: "Manter irrigação programada", text: "A leitura orbital mostra estabilidade hídrica suficiente para evitar consumo excessivo de água." }
  ];

  function renderHistory() {
    grid.innerHTML = recommendations.slice(0, 3).map((item) => `
      <article class="feature-card recommendation-card">
        <span class="risk-pill ${item.level}">${riskLabel(item.level)}</span>
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </article>
    `).join("");
  }

  function generateRecommendation() {
    const item = recommendations[randomBetween(0, recommendations.length - 1)];

    output.innerHTML = `
      <span class="risk-pill ${item.level}">${riskLabel(item.level)}</span>
      <h2>${item.title}</h2>
      <p>${item.text}</p>
      <p><strong>Base da análise:</strong> umidade do solo, temperatura, índice de vegetação e risco climático por setor.</p>
    `;

    diagnostic.textContent = item.level === "high"
      ? "A IA detectou risco relevante e recomenda ação imediata para proteger a produtividade."
      : item.level === "medium"
        ? "A IA encontrou pontos de atenção que podem ser corrigidos com intervenção preventiva."
        : "A IA indica estabilidade operacional e foco em manutenção eficiente dos recursos.";
  }

  renderHistory();
  button.addEventListener("click", generateRecommendation);
}

if (page === "monitoramento") initMonitoringPage();
if (page === "mapa") initMapPage();
if (page === "alertas") initAlertsPage();
if (page === "recomendacoes") initRecommendationsPage();
