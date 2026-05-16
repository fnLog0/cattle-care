# Module: Stress (Individual + Environmental)

## Overview
Two separate stress signals power the dashboard:

1. **Individual cattle stress** (Strain Index) — derived from rectal temperature + respiration rate, breed-normalized.
2. **Environmental stress** (THI — Temperature-Humidity Index) — derived from current weather at the user's location via Open-Meteo.

Both produce the same 5-level classification (`none | mild | moderate | severe | danger`).

> **Persistence**: Each individual stress calculation appends a row to the `vitals` table (full history) **and** updates the latest `cattle.stress_level`. Environmental THI is computed on-demand and not persisted.

---

## Individual Cattle Stress (Strain Index)

### Formula
```
SI = 5 × [ (Tobs − Tmin) / (Tmax − Tmin)
        + (Robs − Rmin) / (Rmax − Rmin) ]

Where:
  Tobs = observed rectal temperature (°C)
  Robs = observed respiration rate (breaths/min)
  Tmin/Tmax, Rmin/Rmax = breed-specific normal ranges
```

### Breed Constants
| Breed       | Tmin | Tmax | Rmin | Rmax |
|-------------|------|------|------|------|
| zebu        | 36.5 | 40.0 | 10   | 120  |
| crossBreed  | 37.0 | 42.0 | 10   | 150  |
| murrah      | 37.0 | 42.0 | 10   | 150  |

### Classification
| Strain Index | Level    |
|--------------|----------|
| SI < 2       | none     |
| 2 ≤ SI < 4   | mild     |
| 4 ≤ SI < 6   | moderate |
| 6 ≤ SI < 8   | severe   |
| SI ≥ 8       | danger   |

Implemented in `backend/src/services/cattle-stress.ts`.

---

## Environmental Stress (THI)

### Formula
```
THI = (1.8 · T + 32) − (0.55 − 0.0055 · RH) · (1.8 · T − 26)

Where:
  T  = dry-bulb temperature (°C)
  RH = relative humidity (%)
```
(NRC 1971 formulation.)

### Classification
| THI            | Level    |
|----------------|----------|
| THI < 72       | none     |
| 72 ≤ THI < 79  | mild     |
| 79 ≤ THI < 89  | moderate |
| 89 ≤ THI < 99  | severe   |
| THI ≥ 99       | danger   |

### Weather Source
- **API**: `https://api.open-meteo.com/v1/forecast?current=temperature_2m,relative_humidity_2m`
- **No auth key required**
- **Cached**: 10 minutes via Cloudflare Workers Cache API; cache key is the request URL with lat/lon rounded to 2 decimals (~1.1 km buckets).

Implemented in `backend/src/services/thi.ts`.

---

## REST API Endpoints

All endpoints require `Authorization: Bearer <token>`.

| Method | Path | Input | Output |
|--------|------|-------|--------|
| `PATCH` | `/api/stress/cattle/:id` | JSON body `{ rectalTemperature, respirationRate }` | `{ cattleId, cattleName, breed, strainIndex, stressLevel, temperatureComponent, respirationComponent, timestamp }` |
| `GET`   | `/api/stress/cattle/:id/history` | Query `?range=7d\|30d\|90d` (default `30d`) | `{ cattleId, range, count, readings: [{ id, rectalTemperature, respirationRate, strainIndex, stressLevel, recordedAt }] }` |
| `GET`   | `/api/stress/environmental` | Query `?latitude=&longitude=` | `{ thi, stressLevel, temperature, humidity, latitude, longitude, timestamp }` |

### Validation
- `rectalTemperature`: 30–45 °C
- `respirationRate`: 1–200 breaths/min
- `latitude`: −90 to 90
- `longitude`: −180 to 180

### Error Cases
| Status | When |
|--------|------|
| 400    | Validation failed (bad numbers, missing field) |
| 401    | Missing or invalid bearer token |
| 404    | Cattle not found for this user (individual endpoint) |
| 502    | Weather API failure (environmental endpoint) |

---

## Individual Stress Flow

```
1. User taps "Update vitals" on cattle detail
2. App PATCH /api/stress/cattle/:id with { rectalTemperature, respirationRate }
3. Worker:
   a. Auth middleware loads session + user
   b. SELECT cattle WHERE id = ? AND user_id = ?  (404 if not found)
   c. Validate body (Zod)
   d. Compute Strain Index via breed constants
   e. In parallel:
      - UPDATE cattle SET stress_level = ?, updated_at = now()
        WHERE id = ? AND user_id = ?
      - INSERT into vitals (history row)
4. Worker returns the computed result (strainIndex, components, timestamp)
5. App updates UI immediately
```

> **Defense-in-depth**: the cattle `UPDATE` is scoped by both `id` and `user_id` even though ownership was already checked in step 3b.

## Vitals History Flow

```
1. App GET /api/stress/cattle/:id/history?range=7d
2. Worker:
   a. Auth middleware
   b. SELECT cattle WHERE id = ? AND user_id = ?  (404 if not found)
   c. Validate range (Zod, default 30d)
   d. SELECT * FROM vitals
      WHERE cattle_id = ?
        AND recorded_at >= datetime('now', '-N days')
      ORDER BY recorded_at ASC
3. Return readings (oldest first — chart-friendly)
```

## Vitals D1 Schema

```sql
CREATE TABLE IF NOT EXISTS vitals (
  id TEXT PRIMARY KEY,
  cattle_id TEXT NOT NULL REFERENCES cattle(id) ON DELETE CASCADE,
  rectal_temperature REAL NOT NULL,
  respiration_rate REAL NOT NULL,
  strain_index REAL NOT NULL,
  stress_level TEXT NOT NULL CHECK (stress_level IN ('none','mild','moderate','severe','danger')),
  recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_vitals_cattle_recorded
  ON vitals(cattle_id, recorded_at);
```

---

## Environmental Stress Flow

```
1. App acquires device location (expo-location)
2. App GET /api/stress/environmental?latitude=…&longitude=…
3. Worker:
   a. Auth middleware
   b. Validate lat/lon (Zod)
   c. Round lat/lon to 2 decimals (cache bucketing)
   d. Cache.match(request) → if hit, reuse upstream response
   e. Else fetch Open-Meteo, set `Cache-Control: public, s-maxage=600`, cache.put
   f. Compute THI + classification
4. Return JSON to app
```

---

## Source Code Map
| Layer | File |
|-------|------|
| Routes | `backend/src/endpoints/stress.ts` |
| Handlers | `backend/src/handlers/stress/cattleStress.ts`, `history.ts`, `environmentalStress.ts` |
| Services | `backend/src/services/cattle-stress.ts`, `thi.ts` |
| Cattle mutation | `backend/src/db/cattle/mutations.ts` → `updateCattleStressLevel(db, id, userId, level)` |
| Vitals history | `backend/src/db/vitals/` → `insertVitals(...)`, `getVitalsHistory(db, cattleId, range)` |

---

## Not Yet Implemented (planned)

| Item | Notes |
|------|-------|
| Trend charts in the app | History endpoint exists; the frontend still needs a chart library + UI on cattle detail + reports. |
| Heart rate + humidity inputs | The earlier 4-vital design (temp + resp + humidity + heart rate) was de-scoped; current SI uses only temp + resp. Add back if/when sensors are available. |
| Push alerts on danger | Notify the user when stress crosses `severe`/`danger`. |
| Auto-recalc on environment change | Cron or queue that re-runs stress for all cattle when THI moves into a higher band. See `flow/10-autonomous-monitoring.md`. |
