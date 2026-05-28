const journalSettings = {
  trader: "trademark830am",
  period: "May 2026",
  costs: {
    swap: 0.66,
    commission: 0.1,
    slippage: 0.3,
  },
};

const trades = [
  {
    date: "05.05.2026 - 08.05.2026",
    pair: "EURUSD",
    direction: "Long",
    rr: 0,
  },
  {
    date: "07.05.2026 - 08.05.2026",
    pair: "EURUSD",
    direction: "Long",
    rr: -1,
  },
  {
    date: "13.05.2026 - 14.05.2026",
    pair: "XAU",
    direction: "Long",
    rr: -1,
  },
  {
    date: "18.05.2026 - 19.05.2026",
    pair: "EURUSD",
    direction: "Long",
    rr: -1,
  },
  {
    date: "21.05.2026 - 21.05.2026",
    pair: "EURUSD",
    direction: "Long",
    rr: -1,
  },
  {
    date: "25.05.2026 - 29.05.2026",
    pair: "EURUSD",
    direction: "Long",
    rr: 3,
  },
];

const rowsElement = document.querySelector("#tradeRows");
const ledgerElement = document.querySelector("#rrLedger");
const equityCurveElement = document.querySelector("#equityCurve");
const avatarElement = document.querySelector("#traderAvatar");

setText("#traderName", journalSettings.trader);
setText("#journalPeriod", journalSettings.period);
setText("#tradeCount", trades.length);
setText("#winRate", `${calculateWinRate(trades)}%`);

if (rowsElement) {
  rowsElement.innerHTML = trades.map(createTradeRow).join("");
}

if (ledgerElement) {
  ledgerElement.innerHTML = createLedger(trades);
}

if (equityCurveElement) {
  equityCurveElement.innerHTML = createEquityCurve(trades);
}

if (avatarElement) {
  prepareAvatar(avatarElement);
  avatarElement.addEventListener("error", () => {
    setAvatarEmpty(avatarElement);
  });
}

document.querySelectorAll(".pair-mark img").forEach((image) => {
  image.addEventListener("error", () => {
    image.closest(".pair-mark")?.remove();
  });
});

function createTradeRow(trade) {
  const direction = trade.direction.toLowerCase();
  const tone = trade.rr >= 0 ? "positive" : "negative";
  const pairCode = getPairImageCode(trade.pair);
  const directionIcon = createDirectionIcon(direction);

  return `
    <tr>
      <td class="date-cell">${escapeHTML(formatDateText(trade.date))}</td>
      <td>
        <div class="pair-cell">
          <span class="pair-mark">
            <span class="pair-fallback" aria-hidden="true"></span>
            <img
              src="assets/pairs/${pairCode}.png"
              width="33"
              height="33"
              alt="${escapeHTML(trade.pair)} logo"
            />
          </span>
          <span class="pair-name">${escapeHTML(trade.pair)}</span>
        </div>
      </td>
      <td>
        <div class="direction-cell">
          <span class="direction-pill ${direction}">
            <span class="direction-icon" aria-hidden="true">${directionIcon}</span>
            ${escapeHTML(trade.direction)}
          </span>
        </div>
      </td>
      <td>
        <div class="rr-cell">
          <span class="rr-value ${tone}">${formatRR(trade.rr)}</span>
        </div>
      </td>
    </tr>
  `;
}

function createDirectionIcon(direction) {
  const path =
    direction === "short"
      ? '<path d="M5 5l10 10M15 8v7H8"></path>'
      : '<path d="M5 15L15 5M8 5h7v7"></path>';

  return `
    <svg viewBox="0 0 20 20" fill="none" focusable="false">
      ${path}
    </svg>
  `;
}

function createLedger(items) {
  const gross = sum(items.map((item) => item.rr));
  const costs = journalSettings.costs || getTradeCosts(items);
  const swap = Number(costs.swap || 0);
  const commission = Number(costs.commission || 0);
  const slippage = Number(costs.slippage || 0);
  const totalCosts = swap + commission + slippage;
  const net = gross - totalCosts;

  return `
    <div class="ledger-line gross">
      <span>Gross RR</span>
      <strong class="${valueTone(gross)}">${formatRR(gross)}</strong>
    </div>

    <div class="cost-stack" aria-label="Swap, commission, and slippage">
      <div class="cost-line">
        <span>Swap</span>
        <strong>${formatCost(swap)}</strong>
      </div>
      <div class="cost-line">
        <span>Commission</span>
        <strong>${formatCost(commission)}</strong>
      </div>
      <div class="cost-line">
        <span>Slippage</span>
        <strong>${formatCost(slippage)}</strong>
      </div>
      <div class="cost-line">
        <span>Total costs</span>
        <strong>${formatCost(totalCosts)}</strong>
      </div>
    </div>

    <div class="ledger-line net">
      <span>Net RR</span>
      <strong class="${valueTone(net)}">${formatRR(net)}</strong>
    </div>
  `;
}

function getTradeCosts(items) {
  return {
    swap: sum(items.map((item) => item.costs?.swap || 0)),
    commission: sum(items.map((item) => item.costs?.commission || 0)),
    slippage: sum(items.map((item) => item.costs?.slippage || 0)),
  };
}

function createEquityCurve(items) {
  const points = [{ label: "Start", value: 0 }];
  let equity = 0;

  items.forEach((trade, index) => {
    equity += Number(trade.rr || 0);
    points.push({
      label: `T${index + 1}`,
      value: Number(equity.toFixed(2)),
    });
  });

  const width = 760;
  const height = 190;
  const padding = { top: 30, right: 18, bottom: 30, left: 38 };
  const values = points.map((point) => point.value);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const range = maxValue - minValue || 1;
  const yMin = minValue - range * 0.14;
  const yMax = maxValue + range * 0.22;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const getX = (index) => padding.left + (plotWidth * index) / (points.length - 1 || 1);
  const getY = (value) =>
    padding.top + ((yMax - value) / (yMax - yMin || 1)) * plotHeight;

  const linePoints = points.map((point, index) => `${getX(index)},${getY(point.value)}`);
  const linePath = `M ${linePoints.join(" L ")}`;
  const areaPath = `${linePath} L ${getX(points.length - 1)},${getY(0)} L ${getX(0)},${getY(0)} Z`;
  const gridValues = getGridValues(minValue, maxValue);
  const zeroY = getY(0);

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Gross RR equity curve">
      ${gridValues
        .map(
          (value) => `
            <line class="equity-grid" x1="${padding.left}" y1="${getY(value)}" x2="${width - padding.right}" y2="${getY(value)}"></line>
          `,
        )
        .join("")}

      <line class="equity-zero" x1="${padding.left}" y1="${zeroY}" x2="${width - padding.right}" y2="${zeroY}"></line>
      <path class="equity-area" d="${areaPath}"></path>
      <path class="equity-line" d="${linePath}"></path>

      ${points
        .map((point, index) => {
          const x = getX(index);
          const y = getY(point.value);
          const labelOffset = point.value >= 0 ? -10 : 18;
          const anchor = index === 0 ? "start" : index === points.length - 1 ? "end" : "middle";

          return `
            <circle class="equity-point" cx="${x}" cy="${y}" r="4"></circle>
            <text class="equity-label" x="${x}" y="${y + labelOffset}" text-anchor="${anchor}">
              ${formatChartNumber(point.value)}
            </text>
          `;
        })
        .join("")}
    </svg>
  `;
}

function getGridValues(minValue, maxValue) {
  const values = [0];

  if (maxValue > 5) {
    values.push(5);
  }

  if (maxValue > 10) {
    values.push(10);
  }

  if (minValue < -5) {
    values.push(-5);
  }

  if (minValue < -10) {
    values.push(-10);
  }

  return values.sort((a, b) => b - a);
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function getPairImageCode(pair) {
  const imageCodes = {
    XAU: "xauusd",
  };

  return (imageCodes[pair] || pair).toLowerCase();
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function prepareAvatar(image) {
  if (image.complete) {
    handleAvatarLoad(image);
    return;
  }

  image.addEventListener("load", () => {
    handleAvatarLoad(image);
  });
}

function handleAvatarLoad(image) {
  if (!image.naturalWidth || !image.naturalHeight) {
    setAvatarEmpty(image);
    return;
  }

  const avatar = image.closest(".avatar");
  if (avatar) {
    avatar.classList.remove("avatar--empty");
    avatar.classList.add("avatar--loaded");
  }
}

function setAvatarEmpty(image) {
  const avatar = image.closest(".avatar");
  if (avatar) {
    avatar.classList.remove("avatar--loaded");
    avatar.classList.add("avatar--empty");
  }
}

function calculateWinRate(items) {
  const wins = items.filter((item) => item.rr > 0).length;
  const losses = items.filter((item) => item.rr < 0).length;
  const countedTrades = wins + losses;

  if (!countedTrades) return 0;
  return Math.round((wins / countedTrades) * 100);
}

function formatDateText(value) {
  return String(value)
    .replaceAll("/", ".")
    .replace(/\s+to\s+/gi, " - ");
}

function formatRR(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}R`;
}

function formatCost(value) {
  if (value === 0) return "-0.00R";
  return `-${value.toFixed(2)}R`;
}

function formatChartNumber(value) {
  if (Math.abs(value) < 0.005) return "0";
  const sign = value > 0 ? "+" : "";
  return `${sign}${Number(value.toFixed(2))}`;
}

function valueTone(value) {
  return value >= 0 ? "positive" : "negative";
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
