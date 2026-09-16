# Smart Cold Storage — Frontend Dashboard

Frontend-only prototype for the SIH Smart Cold Storage project.

## Files
- index.html — dashboard structure
- styles.css — responsive styling
- script.js — demo data, JSON placeholder, UI updates and chart

## Architecture
DHT11 → Arduino UNO → ESP8266 → Wi-Fi → Server/API → Web Dashboard

This package implements only the web dashboard frontend. No backend, database, authentication, ESP8266 connection, or real API is included.

## Expected JSON
```json
{
  "device_id": "COLD_STORAGE_01",
  "temperature": 14.2,
  "humidity": 76,
  "status": "SAFE",
  "cooling": "ON",
  "timestamp": "2026-09-16T13:30:00Z"
}
```

`updateDashboard(data)` in `script.js` is the main integration point. The Refresh button currently simulates incoming readings so the frontend can be demonstrated without a backend.

## Run
Open `index.html` in a browser.
