/* =========================================================
   CORBETT WATER REPORT TEMPLATE
   Reference-matched report behavior
   ========================================================= */


/* =========================================================
   REPORT STATE
   ========================================================= */

const reportState = {
  siteData: null,
  quarterData: null,
  factor: "temperature",
  selectedIndex: null
};


/* =========================================================
   WEATHER FACTOR CONFIGURATION
   ========================================================= */

const FACTORS = {
  temperature: {
    dataKey: "avgHighTemp",
    title: "Usage vs. Average High Temp",
    legend: "Average high temperature (°F)",
    summaryLabel: "average high temperature",
    unit: "°F",
    decimals: 1,
    baseAxisMax: 90,
    axisStep: 15
  },

  precipitation: {
    dataKey: "precipitation",
    title: "Usage vs. Precipitation",
    legend: "Precipitation (in)",
    summaryLabel: "precipitation",
    unit: "in",
    decimals: 2,
    baseAxisMax: 6,
    axisStep: 1
  },

  et: {
    dataKey: "et",
    title: "Usage vs. Evapotranspiration",
    legend: "Evapotranspiration (in)",
    summaryLabel: "evapotranspiration",
    unit: "in",
    decimals: 2,
    baseAxisMax: 6,
    axisStep: 1
  }
};


/* =========================================================
   FORMATTING HELPERS
   ========================================================= */

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 0
  });
}


function formatWeatherValue(value, decimals) {
  return Number(value).toFixed(decimals);
}


function formatPeriod(period) {
  const match = /^(\d{4})-q([1-4])$/i.exec(period);

  if (!match) {
    return period;
  }

  return `Q${match[2]} ${match[1]}`;
}


function formatStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();

  if (normalized === "TEST") {
    return "TEST";
  }

  if (normalized === "FINAL") {
    return "Final";
  }

  return status || "";
}


function isTestStatus(status) {
  return String(status || "").trim().toUpperCase() === "TEST";
}


function monthHasTestData(month) {
  return (
    isTestStatus(month.flowStatus) ||
    isTestStatus(month.weatherStatus)
  );
}


function reportHasTestData() {
  if (!reportState.siteData || !reportState.quarterData) {
    return false;
  }

  if (isTestStatus(reportState.siteData.siteStatus)) {
    return true;
  }

  if (isTestStatus(reportState.quarterData.status)) {
    return true;
  }

  return reportState.quarterData.months.some(monthHasTestData);
}


/* =========================================================
   REPORT IDENTITY
   ========================================================= */

function renderReportIdentity() {
  const siteData = reportState.siteData;

  const formattedPeriod = formatPeriod(siteData.currentPeriod);
  const isTest = reportHasTestData();


  document.title =
    `${siteData.reportDisplayName} | Corbett Water Report`;


  const title =
    document.getElementById("report-title");

  const location =
    document.getElementById("report-location");

  const description =
    document.getElementById("report-description");

  const eyebrow =
    document.getElementById("report-eyebrow");

  const testNote =
    document.getElementById("report-test-note");


  title.textContent =
    siteData.reportDisplayName;

  location.textContent =
    siteData.location || "";

  description.textContent =
    siteData.reportDescription || "";

  eyebrow.textContent =
    `${formattedPeriod} IRRIGATION REPORT`;


  if (isTest) {
    testNote.hidden = false;

    testNote.textContent =
      siteData.testNote ||
      "TEST data is included in this report.";
  } else {
    testNote.hidden = true;
  }


  const mastheadStatus =
    document.getElementById("masthead-status");

  if (isTest) {
    mastheadStatus.hidden = false;
    mastheadStatus.textContent = "EXPERIMENTAL · TEST";
  } else {
    mastheadStatus.hidden = true;
  }


  const footerProperty =
    document.getElementById("footer-property");

  const footerPeriod =
    document.getElementById("footer-period");


  footerProperty.textContent =
    siteData.reportDisplayName;

  footerPeriod.textContent =
    isTest
      ? `${formattedPeriod} · TEST`
      : formattedPeriod;

  footerPeriod.classList.toggle(
    "is-test",
    isTest
  );


  const chartNote =
    document.getElementById("chart-note");

  chartNote.textContent = isTest
    ? "The left and right axes use different units. TEST data is identified where applicable."
    : "The left and right axes use different units.";
}


/* =========================================================
   MONTHLY CARDS
   ========================================================= */

function createMetricRow(label, value) {
  const row =
    document.createElement("div");

  row.className =
    "monthly-card__detail";


  const labelElement =
    document.createElement("span");

  labelElement.textContent =
    label;


  const valueElement =
    document.createElement("strong");

  valueElement.textContent =
    value;


  row.append(
    labelElement,
    valueElement
  );

  return row;
}


function createStatusBlock(label, status) {
  const wrapper =
    document.createElement("span");


  const labelElement =
    document.createElement("span");

  labelElement.textContent =
    `${label} `;


  const statusElement =
    document.createElement("span");

  statusElement.className =
    "monthly-card__status-value";

  statusElement.textContent =
    formatStatus(status);

  statusElement.classList.toggle(
    "is-test",
    isTestStatus(status)
  );


  wrapper.append(
    labelElement,
    statusElement
  );

  return wrapper;
}


function createMonthlyCard(month, index) {
  const button =
    document.createElement("button");

  button.type = "button";

  button.className =
    "monthly-card";

  button.dataset.index =
    String(index);

  button.setAttribute(
    "aria-pressed",
    reportState.selectedIndex === index
      ? "true"
      : "false"
  );


  button.setAttribute(
    "aria-label",
    [
      month.month,
      `${formatNumber(month.irrigationUsage)} gallons irrigation`,
      `average high ${formatWeatherValue(month.avgHighTemp, 1)} degrees Fahrenheit`,
      `${formatWeatherValue(month.precipitation, 2)} inches precipitation`,
      `${formatWeatherValue(month.et, 2)} inches evapotranspiration`,
      `flow status ${formatStatus(month.flowStatus)}`,
      `weather status ${formatStatus(month.weatherStatus)}`
    ].join(", ")
  );


  const headingRow =
    document.createElement("div");

  headingRow.className =
    "monthly-card__heading-row";


  const heading =
    document.createElement("h3");

  heading.textContent =
    month.month;

  headingRow.appendChild(heading);


  if (monthHasTestData(month)) {
    const badge =
      document.createElement("span");

    badge.className =
      "monthly-card__test-badge";

    badge.textContent =
      "TEST";

    headingRow.appendChild(badge);
  }


  const usage =
    document.createElement("div");

  usage.className =
    "monthly-card__usage";


  const usageValueRow =
    document.createElement("div");

  usageValueRow.className =
    "monthly-card__usage-value-row";


  const usageValue =
    document.createElement("span");

  usageValue.className =
    "monthly-card__usage-value";

  usageValue.textContent =
    formatNumber(month.irrigationUsage);


  const usageUnit =
    document.createElement("span");

  usageUnit.className =
    "monthly-card__usage-unit";

  usageUnit.textContent =
    "gal";


  usageValueRow.append(
    usageValue,
    usageUnit
  );


  const usageCaption =
    document.createElement("span");

  usageCaption.className =
    "monthly-card__usage-caption";

  usageCaption.textContent =
    "Irrigation usage";


  usage.append(
    usageValueRow,
    usageCaption
  );


  const details =
    document.createElement("div");

  details.className =
    "monthly-card__details";


  details.append(
    createMetricRow(
      "Avg. high temperature",
      `${formatWeatherValue(month.avgHighTemp, 1)} °F`
    ),

    createMetricRow(
      "Precipitation",
      `${formatWeatherValue(month.precipitation, 2)} in`
    ),

    createMetricRow(
      "ET",
      `${formatWeatherValue(month.et, 2)} in`
    )
  );


  const statuses =
    document.createElement("div");

  statuses.className =
    "monthly-card__statuses";


  statuses.append(
    createStatusBlock(
      "Flow",
      month.flowStatus
    ),

    createStatusBlock(
      "Weather",
      month.weatherStatus
    )
  );


  button.append(
    headingRow,
    usage,
    details,
    statuses
  );


  button.addEventListener(
    "click",
    () => {
      toggleMonthSelection(index);
    }
  );


  return button;
}


function renderMonthlyCards() {
  const container =
    document.getElementById("monthly-cards");

  container.replaceChildren();


  reportState.quarterData.months.forEach(
    (month, index) => {
      container.appendChild(
        createMonthlyCard(month, index)
      );
    }
  );
}


/* =========================================================
   MONTH SELECTION
   ========================================================= */

function toggleMonthSelection(index) {
  if (reportState.selectedIndex === index) {
    setSelectedMonth(null);
  } else {
    setSelectedMonth(index);
  }
}


function setSelectedMonth(index) {
  reportState.selectedIndex =
    index;

  updateCardSelection();
  renderChart();
  updateChartSummary();
  updateLiveRegion();
}


function updateCardSelection() {
  const cards =
    document.querySelectorAll(".monthly-card");

  cards.forEach((card) => {
    const index =
      Number(card.dataset.index);

    const selected =
      reportState.selectedIndex === index;

    card.classList.toggle(
      "is-selected",
      selected
    );

    card.setAttribute(
      "aria-pressed",
      selected ? "true" : "false"
    );
  });
}


/* =========================================================
   WEATHER FACTOR CONTROLS
   ========================================================= */

function setupFactorControls() {
  const buttons =
    document.querySelectorAll(
      ".factor-control__button"
    );


  buttons.forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const factor =
          button.dataset.factor;

        if (!FACTORS[factor]) {
          return;
        }

        reportState.factor =
          factor;

        updateFactorControls();
        renderChart();
        updateChartSummary();
        updateLiveRegion();
      }
    );
  });
}


function updateFactorControls() {
  const config =
    FACTORS[reportState.factor];


  document.querySelectorAll(
    ".factor-control__button"
  ).forEach((button) => {
    const active =
      button.dataset.factor ===
      reportState.factor;

    button.classList.toggle(
      "is-active",
      active
    );

    button.setAttribute(
      "aria-pressed",
      active ? "true" : "false"
    );
  });


  const title =
    document.getElementById("chart-title");

  const legend =
    document.getElementById(
      "weather-legend-label"
    );


  title.textContent =
    config.title;

  legend.textContent =
    config.legend;
}


/* =========================================================
   AXIS CALCULATIONS
   ========================================================= */

function calculateIrrigationAxisMax(months) {
  const maxValue =
    Math.max(
      ...months.map(
        (month) =>
          Number(month.irrigationUsage)
      )
    );

  const step = 30000;

  return Math.max(
    60000,
    Math.ceil(maxValue / step) * step
  );
}


function calculateWeatherAxisMax(
  months,
  config
) {
  const maxValue =
    Math.max(
      ...months.map(
        (month) =>
          Number(month[config.dataKey])
      )
    );

  return Math.max(
    config.baseAxisMax,
    Math.ceil(
      maxValue / config.axisStep
    ) * config.axisStep
  );
}


/* =========================================================
   SVG HELPERS
   ========================================================= */

const SVG_NS =
  "http://www.w3.org/2000/svg";


function svgElement(name, attributes = {}) {
  const element =
    document.createElementNS(
      SVG_NS,
      name
    );


  Object.entries(attributes).forEach(
    ([key, value]) => {
      element.setAttribute(
        key,
        String(value)
      );
    }
  );


  return element;
}


function appendSvgText(
  parent,
  text,
  attributes
) {
  const element =
    svgElement(
      "text",
      attributes
    );

  element.textContent =
    text;

  parent.appendChild(element);

  return element;
}


/* =========================================================
   CHART RENDERING
   ========================================================= */

function renderChart() {
  const container =
    document.getElementById("report-chart");

  hideTooltip();

  container.replaceChildren();


  const months =
    reportState.quarterData.months;

  const config =
    FACTORS[reportState.factor];


  const mobile =
    window.innerWidth <= 640;


  const width =
    Math.max(
      300,
      Math.round(
        container.getBoundingClientRect().width
      )
    );


  const height =
    mobile ? 300 : 340;


  const margin = mobile
    ? {
        top: 18,
        right: 36,
        bottom: 42,
        left: 48
      }
    : {
        top: 18,
        right: 45,
        bottom: 47,
        left: 74
      };


  const plotWidth =
    width -
    margin.left -
    margin.right;


  const plotHeight =
    height -
    margin.top -
    margin.bottom;


  const plotBottom =
    margin.top + plotHeight;


  const plotRight =
    margin.left + plotWidth;


  const irrigationMax =
    calculateIrrigationAxisMax(months);


  const weatherMax =
    calculateWeatherAxisMax(
      months,
      config
    );


  /*
     IMPORTANT ACCESSIBILITY CHANGE:
     The SVG is a group, not an image.
     This keeps the individual interactive
     month regions exposed to assistive technology.
  */

  const svg =
    svgElement(
      "svg",
      {
        viewBox: `0 0 ${width} ${height}`,
        width,
        height,
        role: "group",
        "aria-labelledby":
          "chart-svg-title chart-svg-description"
      }
    );


  const svgTitle =
    svgElement("title", {
      id: "chart-svg-title"
    });

  svgTitle.textContent =
    config.title;

  svg.appendChild(svgTitle);


  const svgDescription =
    svgElement("desc", {
      id: "chart-svg-description"
    });

  svgDescription.textContent =
    "Blue bars show irrigation usage. The green line shows the selected weather factor. Each month is interactive.";

  svg.appendChild(
    svgDescription
  );


  appendSvgText(
    svg,
    "Gallons",
    {
      x: margin.left,
      y: 11,
      class: "chart-axis-title"
    }
  );


  appendSvgText(
    svg,
    config.unit,
    {
      x: plotRight,
      y: 11,
      "text-anchor": "end",
      class: "chart-axis-title"
    }
  );


  const gridSteps = 6;


  for (
    let step = 0;
    step <= gridSteps;
    step += 1
  ) {
    const ratio =
      step / gridSteps;


    const y =
      plotBottom -
      ratio * plotHeight;


    svg.appendChild(
      svgElement(
        "line",
        {
          x1: margin.left,
          x2: plotRight,
          y1: y,
          y2: y,
          class: "chart-gridline"
        }
      )
    );


    const irrigationValue =
      irrigationMax * ratio;


    appendSvgText(
      svg,
      formatNumber(irrigationValue),
      {
        x: margin.left - 10,
        y: y + 4,
        "text-anchor": "end",
        class: "chart-axis-text"
      }
    );


    const weatherValue =
      weatherMax * ratio;


    appendSvgText(
      svg,
      formatWeatherValue(
        weatherValue,
        0
      ),
      {
        x: plotRight + 10,
        y: y + 4,
        "text-anchor": "start",
        class: "chart-axis-text"
      }
    );
  }


  const monthBand =
    plotWidth / months.length;


  const barWidth =
    Math.min(
      84,
      monthBand * 0.42
    );


  const weatherPoints = [];


  months.forEach(
    (month, index) => {
      const centerX =
        margin.left +
        monthBand * index +
        monthBand / 2;


      const irrigationRatio =
        Number(month.irrigationUsage) /
        irrigationMax;


      const barHeight =
        irrigationRatio * plotHeight;


      const barY =
        plotBottom - barHeight;


      const selected =
        reportState.selectedIndex === index;


      const dimmed =
        reportState.selectedIndex !== null &&
        !selected;


      const bar =
        svgElement(
          "rect",
          {
            x: centerX - barWidth / 2,
            y: barY,
            width: barWidth,
            height: barHeight,
            rx: 2,
            class:
              `chart-bar${dimmed ? " is-dimmed" : ""}`
          }
        );


      svg.appendChild(bar);


      const weatherValue =
        Number(
          month[config.dataKey]
        );


      const weatherRatio =
        weatherValue /
        weatherMax;


      const pointY =
        plotBottom -
        weatherRatio * plotHeight;


      weatherPoints.push({
        x: centerX,
        y: pointY,
        selected
      });


      appendSvgText(
        svg,
        month.month,
        {
          x: centerX,
          y: plotBottom + 24,
          "text-anchor": "middle",
          class:
            `chart-month-label${selected ? " is-selected" : ""}`
        }
      );


      if (monthHasTestData(month)) {
        appendSvgText(
          svg,
          "TEST",
          {
            x: centerX,
            y: plotBottom + 39,
            "text-anchor": "middle",
            class: "chart-test-label"
          }
        );
      }
    }
  );


  const pathData =
    weatherPoints
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
      )
      .join(" ");


  svg.appendChild(
    svgElement(
      "path",
      {
        d: pathData,
        class: "chart-weather-line"
      }
    )
  );


  weatherPoints.forEach(
    (point) => {
      svg.appendChild(
        svgElement(
          "circle",
          {
            cx: point.x,
            cy: point.y,
            r: point.selected
              ? 6
              : 4,
            class:
              `chart-weather-point${point.selected ? " is-selected" : ""}`
          }
        )
      );
    }
  );


  /*
     Accessible interactive month regions.
  */

  months.forEach(
    (month, index) => {
      const x =
        margin.left +
        monthBand * index;


      const selected =
        reportState.selectedIndex === index;


      const region =
        svgElement(
          "rect",
          {
            x,
            y: margin.top,
            width: monthBand,
            height:
              plotHeight +
              margin.bottom,
            fill: "transparent",
            tabindex: "0",
            role: "button",
            "aria-pressed":
              selected ? "true" : "false",
            "aria-label":
              buildChartRegionLabel(
                month,
                config
              ),
            "data-index": index,
            style: "cursor:pointer"
          }
        );


      region.addEventListener(
        "click",
        () => {
          toggleMonthSelection(index);
        }
      );


      region.addEventListener(
        "keydown",
        (event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();

            toggleMonthSelection(index);
          }
        }
      );


      region.addEventListener(
        "pointerenter",
        (event) => {
          showTooltip(
            index,
            event.clientX,
            event.clientY
          );
        }
      );


      region.addEventListener(
        "pointermove",
        (event) => {
          showTooltip(
            index,
            event.clientX,
            event.clientY
          );
        }
      );


      region.addEventListener(
        "pointerleave",
        hideTooltip
      );


      region.addEventListener(
        "focus",
        () => {
          showTooltipForElement(
            index,
            region
          );
        }
      );


      region.addEventListener(
        "blur",
        hideTooltip
      );


      svg.appendChild(region);
    }
  );


  container.appendChild(svg);
}


/* =========================================================
   CHART ACCESSIBLE LABELS
   ========================================================= */

function buildChartRegionLabel(
  month,
  config
) {
  return [
    month.month,
    `${formatNumber(month.irrigationUsage)} gallons irrigation`,
    `${config.summaryLabel} ${formatWeatherValue(month[config.dataKey], config.decimals)} ${config.unit}`,
    `flow status ${formatStatus(month.flowStatus)}`,
    `weather status ${formatStatus(month.weatherStatus)}`,
    "Press Enter or Space to select"
  ].join(", ");
}


/* =========================================================
   TOOLTIP
   ========================================================= */

function buildTooltipContent(index) {
  const month =
    reportState.quarterData.months[index];

  const config =
    FACTORS[reportState.factor];


  const wrapper =
    document.createElement("div");


  const heading =
    document.createElement("div");

  heading.className =
    "chart-tooltip__month";

  heading.textContent =
    month.month;


  wrapper.appendChild(heading);


  wrapper.appendChild(
    createTooltipRow(
      "Irrigation",
      `${formatNumber(month.irrigationUsage)} gal`
    )
  );


  wrapper.appendChild(
    createTooltipRow(
      config.summaryLabel,
      `${formatWeatherValue(
        month[config.dataKey],
        config.decimals
      )} ${config.unit}`
    )
  );


  const statuses =
    document.createElement("div");

  statuses.className =
    "chart-tooltip__status";


  statuses.textContent =
    `Flow: ${formatStatus(month.flowStatus)} · Weather: ${formatStatus(month.weatherStatus)}`;


  wrapper.appendChild(
    statuses
  );


  if (month.statusNote) {
    const note =
      document.createElement("div");

    note.className =
      "chart-tooltip__status";

    note.textContent =
      month.statusNote;

    wrapper.appendChild(note);
  }


  return wrapper;
}


function createTooltipRow(label, value) {
  const row =
    document.createElement("div");

  row.className =
    "chart-tooltip__row";


  const left =
    document.createElement("span");

  left.textContent =
    label;


  const right =
    document.createElement("strong");

  right.textContent =
    value;


  row.append(
    left,
    right
  );


  return row;
}


function showTooltip(
  index,
  clientX,
  clientY
) {
  const tooltip =
    document.getElementById(
      "chart-tooltip"
    );

  const shell =
    tooltip.parentElement;


  tooltip.replaceChildren(
    buildTooltipContent(index)
  );

  tooltip.hidden =
    false;


  const shellRect =
    shell.getBoundingClientRect();


  positionTooltip(
    tooltip,
    clientX - shellRect.left,
    clientY - shellRect.top
  );
}


function showTooltipForElement(
  index,
  element
) {
  const tooltip =
    document.getElementById(
      "chart-tooltip"
    );

  const shell =
    tooltip.parentElement;


  const shellRect =
    shell.getBoundingClientRect();


  const elementRect =
    element.getBoundingClientRect();


  tooltip.replaceChildren(
    buildTooltipContent(index)
  );

  tooltip.hidden =
    false;


  const x =
    elementRect.left -
    shellRect.left +
    elementRect.width / 2;


  const y =
    elementRect.top -
    shellRect.top +
    28;


  positionTooltip(
    tooltip,
    x,
    y
  );
}


function positionTooltip(
  tooltip,
  x,
  y
) {
  const shell =
    tooltip.parentElement;


  const shellWidth =
    shell.clientWidth;


  const tooltipWidth =
    tooltip.offsetWidth;


  const tooltipHeight =
    tooltip.offsetHeight;


  const horizontalPadding = 8;


  let left =
    x + 14;


  if (
    left + tooltipWidth >
    shellWidth - horizontalPadding
  ) {
    left =
      x -
      tooltipWidth -
      14;
  }


  left =
    Math.max(
      horizontalPadding,
      left
    );


  let top =
    y -
    tooltipHeight -
    14;


  if (top < 8) {
    top =
      y + 14;
  }


  tooltip.style.left =
    `${left}px`;

  tooltip.style.top =
    `${top}px`;
}


function hideTooltip() {
  const tooltip =
    document.getElementById(
      "chart-tooltip"
    );

  if (!tooltip) {
    return;
  }

  tooltip.hidden =
    true;

  tooltip.replaceChildren();
}


/* =========================================================
   CHART SUMMARY
   ========================================================= */

function updateChartSummary() {
  const summary =
    document.getElementById(
      "chart-summary"
    );

  const clearButton =
    document.getElementById(
      "clear-selection"
    );


  if (reportState.selectedIndex === null) {
    summary.textContent =
      "All three months shown. Select a card or chart point for details.";

    clearButton.hidden =
      true;

    return;
  }


  const month =
    reportState.quarterData.months[
      reportState.selectedIndex
    ];


  const config =
    FACTORS[reportState.factor];


  summary.textContent =
    `${month.month}: ${formatNumber(month.irrigationUsage)} gal irrigation · ${config.summaryLabel} ${formatWeatherValue(month[config.dataKey], config.decimals)} ${config.unit}.`;


  clearButton.hidden =
    false;
}


/* =========================================================
   LIVE ACCESSIBILITY ANNOUNCEMENTS
   ========================================================= */

function updateLiveRegion() {
  const region =
    document.getElementById(
      "chart-live-region"
    );


  const config =
    FACTORS[reportState.factor];


  if (reportState.selectedIndex === null) {
    region.textContent =
      `${config.title}. No month selected.`;

    return;
  }


  const month =
    reportState.quarterData.months[
      reportState.selectedIndex
    ];


  region.textContent =
    `${month.month} selected. ${formatNumber(month.irrigationUsage)} gallons irrigation. ${config.summaryLabel} ${formatWeatherValue(month[config.dataKey], config.decimals)} ${config.unit}.`;
}


/* =========================================================
   CLEAR SELECTION
   ========================================================= */

function setupClearSelection() {
  const button =
    document.getElementById(
      "clear-selection"
    );


  button.addEventListener(
    "click",
    () => {
      setSelectedMonth(null);
    }
  );
}


/* =========================================================
   RESPONSIVE CHART REDRAW
   ========================================================= */

let resizeFrame = null;


function setupResponsiveChart() {
  window.addEventListener(
    "resize",
    () => {
      if (resizeFrame !== null) {
        cancelAnimationFrame(
          resizeFrame
        );
      }


      resizeFrame =
        requestAnimationFrame(
          () => {
            renderChart();

            resizeFrame =
              null;
          }
        );
    }
  );
}


/* =========================================================
   REPORT RENDERING
   ========================================================= */

function renderReport() {
  renderReportIdentity();

  renderMonthlyCards();

  updateFactorControls();

  renderChart();

  updateChartSummary();

  updateCardSelection();

  updateLiveRegion();
}


/* =========================================================
   DATA LOADING
   ========================================================= */

async function loadReport() {
  try {

    const siteResponse =
      await fetch(
        "./data/index.json",
        {
          cache: "no-store"
        }
      );


    if (!siteResponse.ok) {
      throw new Error(
        `Unable to load data/index.json (${siteResponse.status})`
      );
    }


    const siteData =
      await siteResponse.json();


    const quarterPath =
      `./data/quarters/${siteData.currentPeriod}.json`;


    const quarterResponse =
      await fetch(
        quarterPath,
        {
          cache: "no-store"
        }
      );


    if (!quarterResponse.ok) {
      throw new Error(
        `Unable to load ${quarterPath} (${quarterResponse.status})`
      );
    }


    const quarterData =
      await quarterResponse.json();


    if (
      !Array.isArray(
        quarterData.months
      ) ||
      quarterData.months.length === 0
    ) {
      throw new Error(
        "Quarter data does not contain monthly reporting data."
      );
    }


    reportState.siteData =
      siteData;

    reportState.quarterData =
      quarterData;


    renderReport();

  } catch (error) {

    console.error(
      "Unable to load Corbett Water Report:",
      error
    );


    const reportTitle =
      document.getElementById(
        "report-title"
      );


    if (reportTitle) {
      reportTitle.textContent =
        "Report unavailable";
    }


    const description =
      document.getElementById(
        "report-description"
      );


    if (description) {
      description.textContent =
        "Report data could not be loaded.";
    }


    const cards =
      document.getElementById(
        "monthly-cards"
      );


    if (cards) {
      cards.replaceChildren();

      const message =
        document.createElement("p");

      message.textContent =
        "Monthly report data is unavailable.";

      cards.appendChild(
        message
      );
    }


    const chart =
      document.getElementById(
        "report-chart"
      );


    if (chart) {
      chart.textContent =
        "Chart data is unavailable.";
    }
  }
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initialize() {
  setupFactorControls();

  setupClearSelection();

  setupResponsiveChart();

  loadReport();
}


initialize();
