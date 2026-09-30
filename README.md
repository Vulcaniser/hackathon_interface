# Smart Milk Chilling Can — Frontend Dashboard

Frontend-only dashboard prototype adapted for the new SIH problem statement:

**Low-cost, lightweight milk chilling can for rural and remote dairy-producing regions.**

The dashboard is designed around a 30–40 litre milk can that aims to keep milk in the recommended chilled-storage range of **4–8°C** for several hours during collection and transportation.

---

## 1. Proposed system idea

The project keeps the same three-part architecture from the earlier cold-storage concept, but applies it to a portable milk chilling can.

### System 1 — Cooling / thermal management

The physical can uses:

- Food-grade lightweight container material such as HDPE, aluminium alloy or a suitable composite.
- Double-wall construction.
- PUF or another cost-effective insulating layer.
- A chilling mechanism such as reusable ice packs / PCM / passive cooling.
- Solar-assisted active cooling and battery support can be added where the prototype requires powered chilling.
- The insulation and cold-storage media provide thermal holdover when external power is unavailable.

The design goal is to maintain milk around **4–8°C** for the expected 6–12 hour transport/collection period.

### System 2 — Baseline control and monitoring

A local controller receives temperature data from the temperature-sensing system.

Conceptually:

```text
Temperature sensor
       ↓
Arduino / controller
       ↓
Local temperature decision
       ↓
Cooling control
       ↓
Local display / indicator
```

The local controller should continue to monitor the can even if the internet connection is unavailable.

For a physical food-contact prototype, a probe suitable for liquid-temperature measurement (for example, a waterproof temperature probe) is preferable to relying on an ambient-humidity sensor alone.

### System 3 — Communication and remote dashboard

The communication chain is:

```text
Temperature sensor
        ↓
Arduino / controller
        ↓
UART / Serial
        ↓
ESP8266
        ↓
Wi-Fi
        ↓
Server / API
        ↓
Web dashboard
```

The Arduino/controller handles local sensing and control.

The ESP8266 handles wireless communication.

The web dashboard displays the data remotely.

---

## 2. Frontend JSON contract

The dashboard is prepared to receive data in JSON form.

Example:

```json
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
```

### Fields

| Field | Meaning |
|---|---|
| `device_id` | Unique identifier of the milk can |
| `capacity_litres` | Can capacity |
| `milk_temperature` | Temperature measured inside the milk/can |
| `ambient_temperature` | Outside/ambient temperature |
| `status` | SAFE / WARNING / CRITICAL / LOW TEMP |
| `cooling` | Current cooling state |
| `solar` | Solar input state |
| `battery_percent` | Battery charge level |
| `timestamp` | Time of the latest reading |

The main frontend integration point is:

```javascript
updateDashboard(data)
```

The future API only needs to provide JSON in the expected structure.

---

## 3. What the dashboard shows

The farmer/operator can immediately see:

- Milk temperature
- Ambient temperature
- Milk status
- Cooling state
- Solar availability
- Battery percentage
- Temperature sensor connection
- Wi-Fi connection
- Recent milk-temperature history
- Last update time

The interface intentionally avoids technical information on the main screen. The JSON preview is kept inside a developer-only expandable section.

---

## 4. Why this is useful for the problem

The problem is not simply about cooling milk; it is about making chilled milk transport practical for small and marginal dairy farmers in remote areas.

The proposed concept addresses that by combining:

**Lightweight physical can**

→ easier handling and transportation

**Insulation + PCM / ice packs / passive cooling**

→ reduces heat gain and helps maintain temperature without continuous external power

**Solar + battery support**

→ provides a renewable power source where active chilling or monitoring is required

**Local controller**

→ keeps monitoring/control available even without internet

**ESP8266 communication**

→ sends readings remotely

**Simple web dashboard**

→ allows a collection-centre operator or other authorized user to monitor milk temperature without physically opening the can

---

## 5. Important prototype distinction

The dashboard is a frontend prototype only.

It currently contains simulated JSON data so the UI can be demonstrated without a backend.

There is currently:

- No server
- No database
- No authentication
- No real ESP8266 connection
- No real API
- No cloud deployment

Those can be added later.

---

## 6. Files

- `index.html` — dashboard structure
- `styles.css` — responsive UI
- `script.js` — demo JSON, dashboard logic, chart and future API integration point
- `README.md` — architecture and integration documentation

---

## 7. Run

Open `index.html` in a browser.

Use **Refresh** to simulate a new JSON reading.

Later, the demo data can be replaced with something such as:

```javascript
fetch("/api/milk-can/MILK_CAN_01")
  .then(response => response.json())
  .then(data => {
    updateDashboard(data);
    setConnection(true);
  })
  .catch(() => setConnection(false));
```

No backend is included in this frontend package.
