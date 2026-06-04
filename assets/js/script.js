const page = document.body.dataset.page;

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

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

function trapFocus(element) {
  const focusable = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const previousFocus = document.activeElement;

  function handler(e) {
    if (e.key === "Escape") {
      const closeBtn = element.querySelector(".modal-close");
      if (closeBtn) closeBtn.click();
      return;
    }
    if (e.key !== "Tab") return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  element.addEventListener("keydown", handler);
  if (first) first.focus();

  return () => {
    element.removeEventListener("keydown", handler);
    if (previousFocus) previousFocus.focus();
  };
}

function initMonitoringPage() {
  const MAX_HISTORY = 10;
  const history = { temp: [], humidity: [], ndvi: [], labels: [] };
  let tempChart, humidityChart, ndviChart;

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

  function createChartConfig(label, color, min, max) {
    return {
      type: "line",
      data: {
        labels: [],
        datasets: [{
          label,
          data: [],
          borderColor: color,
          backgroundColor: color + "22",
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: color
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: {
          x: {
            ticks: { color: "#aab6b1", font: { size: 10 } },
            grid: { color: "rgba(255,255,255,0.06)" }
          },
          y: {
            min,
            max,
            ticks: { color: "#aab6b1", font: { size: 10 } },
            grid: { color: "rgba(255,255,255,0.06)" }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    };
  }

  if (typeof Chart !== "undefined") {
    tempChart = new Chart(
      document.querySelector("#tempChart"),
      createChartConfig("Temperatura (°C)", "#42c773", 18, 42)
    );
    humidityChart = new Chart(
      document.querySelector("#humidityChart"),
      createChartConfig("Umidade (%)", "#7cc7d9", 15, 85)
    );
    ndviChart = new Chart(
      document.querySelector("#ndviChart"),
      createChartConfig("NDVI", "#ffd166", 0.3, 1.0)
    );
  }

  function updateCharts(temp, humidity, ndvi) {
    const time = formatTime();
    history.labels.push(time);
    history.temp.push(temp);
    history.humidity.push(humidity);
    history.ndvi.push(ndvi);

    if (history.labels.length > MAX_HISTORY) {
      history.labels.shift();
      history.temp.shift();
      history.humidity.shift();
      history.ndvi.shift();
    }

    [
      [tempChart, history.temp],
      [humidityChart, history.humidity],
      [ndviChart, history.ndvi]
    ].forEach(([chart, data]) => {
      if (!chart) return;
      chart.data.labels = [...history.labels];
      chart.data.datasets[0].data = [...data];
      chart.update();
    });
  }

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

    elements.telemetryList.textContent = "";
    telemetry.forEach(([label, value]) => {
      const item = document.createElement("div");
      item.className = "telemetry-item";
      const labelSpan = document.createElement("span");
      labelSpan.textContent = label;
      const valueStrong = document.createElement("strong");
      valueStrong.textContent = value;
      item.append(labelSpan, valueStrong);
      elements.telemetryList.appendChild(item);
    });

    updateCharts(temp, humidity, ndvi);

    document.querySelectorAll(".metric-card").forEach(card => {
      card.classList.remove("updating");
      void card.offsetWidth;
      card.classList.add("updating");
    });
  }

  updateDashboard();
  elements.forceUpdate.addEventListener("click", updateDashboard);
  const dashboardInterval = setInterval(updateDashboard, 6000);

  window.addEventListener("beforeunload", () => clearInterval(dashboardInterval));
}

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

  let removeTrap = null;

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

  function openModalFn() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    removeTrap = trapFocus(modal);
  }

  function closeModalFn() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (removeTrap) {
      removeTrap();
      removeTrap = null;
    }
    openModal.focus();
  }

  openModal.addEventListener("click", openModalFn);
  closeModal.addEventListener("click", closeModalFn);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModalFn();
  });

  selectSector("a");
}

function initAlertsPage() {
  const MAX_ALERTS = 20;
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

  const alertIconSvg = '<svg class="icon small" viewBox="0 0 24 24"><path d="M12 9v4"></path><path d="M12 17h.01"></path><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path></svg>';

  function showEmptyState() {
    const empty = document.createElement("div");
    empty.className = "alerts-empty";
    empty.textContent = "Nenhum alerta ativo — monitoramento em andamento.";
    alertsList.appendChild(empty);
  }

  function createAlert() {
    const emptyEl = alertsList.querySelector(".alerts-empty");
    if (emptyEl) emptyEl.remove();

    const alert = alertTemplates[randomBetween(0, alertTemplates.length - 1)];

    const card = document.createElement("article");
    card.className = `alert-card ${alert.level}`;

    const iconDiv = document.createElement("div");
    iconDiv.className = "alert-icon";
    iconDiv.setAttribute("aria-hidden", "true");
    iconDiv.innerHTML = alertIconSvg;

    const content = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = alert.title;
    const desc = document.createElement("p");
    desc.textContent = `${alert.sector} • ${alert.action}`;
    const timeEl = document.createElement("time");
    timeEl.className = "alert-time";
    timeEl.textContent = formatTime();
    content.append(title, desc, timeEl);

    const pill = document.createElement("span");
    pill.className = `risk-pill ${alert.level}`;
    pill.textContent = riskLabel(alert.level);

    card.append(iconDiv, content, pill);
    alertsList.prepend(card);

    while (alertsList.children.length > MAX_ALERTS) {
      alertsList.removeChild(alertsList.lastElementChild);
    }
  }

  generateAlert.addEventListener("click", createAlert);
  clearAlerts.addEventListener("click", () => {
    alertsList.textContent = "";
    showEmptyState();
  });

  createAlert();
  createAlert();
  const alertsInterval = setInterval(createAlert, 9000);

  window.addEventListener("beforeunload", () => clearInterval(alertsInterval));
}

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
    grid.textContent = "";
    recommendations.slice(0, 3).forEach((item) => {
      const card = document.createElement("article");
      card.className = "feature-card recommendation-card";

      const pill = document.createElement("span");
      pill.className = `risk-pill ${item.level}`;
      pill.textContent = riskLabel(item.level);

      const h3 = document.createElement("h3");
      h3.textContent = item.title;

      const p = document.createElement("p");
      p.textContent = item.text;

      card.append(pill, h3, p);
      grid.appendChild(card);
    });
  }

  function generateRecommendation() {
    const item = recommendations[randomBetween(0, recommendations.length - 1)];

    output.textContent = "";

    const pill = document.createElement("span");
    pill.className = `risk-pill ${item.level}`;
    pill.textContent = riskLabel(item.level);

    const h2 = document.createElement("h2");
    h2.textContent = item.title;

    const p1 = document.createElement("p");
    p1.textContent = item.text;

    const p2 = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = "Base da análise: ";
    p2.appendChild(strong);
    p2.appendChild(document.createTextNode("umidade do solo, temperatura, índice de vegetação e risco climático por setor."));

    output.append(pill, h2, p1, p2);

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
