/*
  SMART MILK CHILLING CAN — FRONTEND ONLY

  Architecture:
  Temperature sensor(s) → Arduino/controller → ESP8266 → Wi-Fi → API/server → dashboard

  No backend is used here.

  Replace demoJSON with the JSON eventually received from the ESP8266/server.

  Example future payload:
  {
    "device_id": "MILK_CAN_01",
    "capacity_litres": 40,
    "milk_temperature": 6.2,
    "ambient_temperature": 31.5,
    "status": "SAFE",
    "cooling": "ON",
    "solar": "AVAILABLE",
    "battery_percent": 82,
    "timestamp": "2026-09-30T11:30:00Z"
  }
*/

const demoJSON = {
  device_id: "MILK_CAN_01",
  capacity_litres: 40,
  milk_temperature: 6.2,
  ambient_temperature: 31.5,
  status: "SAFE",
  cooling: "ON",
  solar: "AVAILABLE",
  battery_percent: 82,
  timestamp: new Date().toISOString()
};

const history = [
  { time: "08:00", temperature: 7.1 },
  { time: "10:00", temperature: 6.7 },
  { time: "12:00", temperature: 6.4 },
  { time: "14:00", temperature: 6.2 },
  { time: "16:00", temperature: 6.1 },
  { time: "18:00", temperature: 6.2 }
];

const $ = (id) => document.getElementById(id);

function formatTime(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getMilkStatus(temperature) {
  if (!Number.isFinite(temperature)) {
    return "UNKNOWN";
  }

  if (temperature >= 4 && temperature <= 8) {
    return "SAFE";
  }

  if (temperature > 8 && temperature <= 10) {
    return "WARNING";
  }

  if (temperature > 10) {
    return "CRITICAL";
  }

  // Below the intended range is also flagged rather than calling it safe.
  if (temperature < 4) {
    return "LOW TEMP";
  }

  return "UNKNOWN";
}

function updateDashboard(data) {
  const milkTemperature = Number(data.milk_temperature);
  const ambientTemperature = Number(data.ambient_temperature);
  const battery = Number(data.battery_percent);

  const status = String(
    data.status || getMilkStatus(milkTemperature)
  ).toUpperCase();

  const cooling = String(data.cooling || "UNKNOWN").toUpperCase();
  const solar = String(data.solar || "UNKNOWN").toUpperCase();

  $("deviceId").textContent = data.device_id || "MILK_CAN_01";
  $("capacity").textContent = `${data.capacity_litres || 40} L`;

  $("milkTemperature").textContent =
    Number.isFinite(milkTemperature) ? milkTemperature.toFixed(1) : "--";

  $("milkTemperatureSmall").textContent =
    Number.isFinite(milkTemperature) ? milkTemperature.toFixed(1) : "--";

  $("ambientTemperature").textContent =
    Number.isFinite(ambientTemperature) ? ambientTemperature.toFixed(1) : "--";

  $("ambientTemperatureSmall").textContent =
    Number.isFinite(ambientTemperature) ? ambientTemperature.toFixed(1) : "--";

  $("milkStatus").textContent = status;
  $("statusSmall").textContent = status;

  $("coolingState").textContent = cooling;
  $("coolingSmall").textContent = cooling;

  $("solarState").textContent = solar;

  $("batteryState").textContent =
    Number.isFinite(battery) ? `${Math.round(battery)}%` : "--";

  $("lastUpdated").textContent = formatTime(data.timestamp);

  const warning = status === "WARNING";
  const critical = status === "CRITICAL" || status === "LOW TEMP";

  const banner = $("alertBanner");

  banner.classList.toggle("warning", warning);
  banner.classList.toggle("critical", critical);
  banner.classList.toggle("safe", !warning && !critical);

  if (critical) {
    $("alertIcon").textContent = "!";
    $("alertTitle").textContent =
      status === "LOW TEMP"
        ? "Milk temperature is below the target range"
        : "Milk temperature is too high";

    $("alertMessage").textContent =
      status === "LOW TEMP"
        ? "Check the cooling conditions and temperature sensor."
        : "Milk temperature is above the recommended chilled-storage range.";
  } else if (warning) {
    $("alertIcon").textContent = "!";
    $("alertTitle").textContent = "Milk temperature needs attention";
    $("alertMessage").textContent =
      "The temperature is above the preferred 4–8°C range.";
  } else {
    $("alertIcon").textContent = "✓";
    $("alertTitle").textContent =
      "Milk is within the safe temperature range";
    $("alertMessage").textContent =
      "The monitored milk temperature is suitable for chilled storage.";
  }

  $("jsonPreview").textContent = JSON.stringify(data, null, 2);
}

function setConnection(connected) {
  $("connectionText").textContent =
    connected ? "Connected" : "Connection unavailable";

  $("connectionDot").classList.toggle("offline", !connected);

  ["sensorState", "wifiState"].forEach((id) => {
    const element = $(id);

    element.textContent = connected ? "Online" : "Offline";
    element.classList.toggle("good", connected);
    element.classList.toggle("bad", !connected);
  });
}

function drawChart(dataPoints) {
  const canvas = $("temperatureChart");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);

  const padding = {
    left: 48,
    right: 18,
    top: 20,
    bottom: 34
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = dataPoints.map((point) => point.temperature);

  const minValue = Math.floor(Math.min(...values) - 1);
  const maxValue = Math.ceil(Math.max(...values) + 1);

  // Grid
  ctx.strokeStyle = "#dce8e4";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#647872";
  ctx.font = "11px Arial";

  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartHeight * i / 4);
    const value =
      maxValue - ((maxValue - minValue) * i / 4);

    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    ctx.fillText(`${value.toFixed(0)}°`, 10, y + 4);
  }

  // Target band: 4–8°C
  if (minValue <= 8 && maxValue >= 4) {
    const top =
      padding.top +
      chartHeight -
      ((8 - minValue) / (maxValue - minValue)) * chartHeight;

    const bottom =
      padding.top +
      chartHeight -
      ((4 - minValue) / (maxValue - minValue)) * chartHeight;

    ctx.fillStyle = "rgba(23, 130, 77, 0.08)";
    ctx.fillRect(
      padding.left,
      top,
      chartWidth,
      bottom - top
    );
  }

  // X labels
  dataPoints.forEach((point, index) => {
    const x =
      padding.left +
      (chartWidth * index /
        Math.max(dataPoints.length - 1, 1));

    ctx.fillStyle = "#647872";
    ctx.fillText(point.time, x - 13, height - 12);
  });

  // Temperature line
  const points = dataPoints.map((point, index) => {
    const x =
      padding.left +
      (chartWidth * index /
        Math.max(dataPoints.length - 1, 1));

    const y =
      padding.top +
      chartHeight -
      ((point.temperature - minValue) /
        (maxValue - minValue)) *
        chartHeight;

    return { x, y };
  });

  ctx.beginPath();

  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });

  ctx.strokeStyle = "#1d755c";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  // Points
  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#1d755c";
    ctx.fill();
  });
}

function simulateRefresh() {
  // Frontend-only simulation.
  // This imitates a new JSON reading arriving from the remote unit.

  const next = {
    ...demoJSON,

    milk_temperature: +(
      demoJSON.milk_temperature +
      (Math.random() * 0.8 - 0.4)
    ).toFixed(1),

    ambient_temperature: +(
      demoJSON.ambient_temperature +
      (Math.random() * 1.0 - 0.5)
    ).toFixed(1),

    battery_percent: Math.max(
      0,
      Math.min(
        100,
        Math.round(
          demoJSON.battery_percent +
          (Math.random() * 2 - 1)
        )
      )
    ),

    timestamp: new Date().toISOString()
  };

  next.status = getMilkStatus(next.milk_temperature);

  // Demonstration logic only.
  next.cooling =
    next.milk_temperature > 8 ? "ON" : "HOLD";

  Object.assign(demoJSON, next);

  history.push({
    time: formatTime(next.timestamp),
    temperature: next.milk_temperature
  });

  if (history.length > 8) {
    history.shift();
  }

  updateDashboard(demoJSON);
  drawChart(history);
}

$("refreshBtn").addEventListener("click", simulateRefresh);

window.addEventListener("resize", () => {
  drawChart(history);
});

// Initial frontend demo state.
updateDashboard(demoJSON);
setConnection(true);
drawChart(history);

/*
  FUTURE BACKEND INTEGRATION

  When your ESP8266/server is ready, the frontend can receive JSON
  from an API instead of using demoJSON.

  Example:

  fetch("/api/milk-can/MILK_CAN_01")
    .then(response => response.json())
    .then(data => {
      updateDashboard(data);
      setConnection(true);
    })
    .catch(() => setConnection(false));

  The UI is deliberately separated from the data source so the
  backend can be connected later without redesigning the dashboard.
*/
