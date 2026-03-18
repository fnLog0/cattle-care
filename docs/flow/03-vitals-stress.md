# Module: Vitals & Stress Calculation

## Overview
Records animal vitals (temperature, respiratory rate, humidity, heart rate) and calculates a stress level using a threshold-based engine. Data stored in Cloudflare D1.

## D1 Database Schema

```sql
CREATE TABLE vitals (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  cattle_id TEXT NOT NULL REFERENCES cattle(id) ON DELETE CASCADE,
  temperature REAL NOT NULL,
  respiratory_rate REAL NOT NULL,
  humidity REAL NOT NULL,
  heart_rate REAL NOT NULL,
  stress_index INTEGER NOT NULL,
  stress_level TEXT NOT NULL CHECK (stress_level IN ('none', 'mild', 'moderate', 'severe', 'danger')),
  recorded_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_vitals_cattle_id ON vitals(cattle_id);
CREATE INDEX idx_vitals_recorded_at ON vitals(recorded_at);
```

## Vital Inputs

| Vital | Unit | Normal Range | Warning | Critical |
|-------|------|-------------|---------|----------|
| Temperature | °C | ≤ 37 | > 37 | > 40 |
| Respiratory Rate | breaths/min | ≤ 40 | > 40 | > 80 |
| Humidity | % | ≤ 70 | > 70 | > 85 |
| Heart Rate | bpm | ≤ 80 | > 80 | > 100 |

## Stress Level Calculation

### Step 1: Score Each Vital (0–2)
```
For each vital:
  0 = Normal (within normal range)
  1 = Warning (above warning threshold)
  2 = Critical (above critical threshold)
```

### Step 2: Calculate Total Score
```
totalScore = tempScore + respScore + humidityScore + heartRateScore
Range: 0 to 8
```

### Step 3: Map to Stress Level

| Total Score | Stress Level | Color | Badge |
|-------------|-------------|-------|-------|
| 0 | No Stress | Green (#22C55E) | ✅ |
| 1–2 | Mild Stress | Amber (#F59E0B) | 🟡 |
| 3–4 | Moderate Stress | Orange (#F97316) | 🟠 |
| 5–6 | Severe Stress | Red (#EF4444) | 🔴 |
| 7–8 | Danger Zone | Dark Red (#991B1B) | ⛔ |

## REST API Endpoints

### Mutations
| Method | Path | Input (JSON Body) | Output | Auth |
|--------|------|-------------------|--------|------|
| `POST` | `/api/cattle/:id/vitals` | `{ temperature, respiratoryRate, humidity, heartRate }` | `Cattle` (updated) | ✅ Yes |

### Queries
| Method | Path | Input | Output | Auth |
|--------|------|-------|--------|------|
| `GET` | `/api/cattle/:id/vitals` | query: `?range=7d\|30d\|90d` | `[Vitals]` | ✅ Yes |

## Flow

### Record Vitals Flow
```
1. POST /api/cattle/:id/vitals with { temperature, respiratoryRate, humidity, heartRate }
2. Worker calculates stress score + level
3. INSERT into vitals table
4. UPDATE cattle SET stress_level = ? WHERE id = ?
5. Return updated cattle with new vitals
```

### Worker Logic (Pseudocode)
```javascript
function calculateStress(vitals) {
  let score = 0;

  // Temperature
  if (vitals.temperature > 40) score += 2;
  else if (vitals.temperature > 37) score += 1;

  // Respiratory Rate
  if (vitals.respiratoryRate > 80) score += 2;
  else if (vitals.respiratoryRate > 40) score += 1;

  // Humidity
  if (vitals.humidity > 85) score += 2;
  else if (vitals.humidity > 70) score += 1;

  // Heart Rate
  if (vitals.heartRate > 100) score += 2;
  else if (vitals.heartRate > 80) score += 1;

  const levels = ['none', 'mild', 'mild', 'moderate', 'moderate',
                  'severe', 'severe', 'danger', 'danger'];
  return { score, level: levels[score] };
}
```

### SQL: Insert Vitals + Update Cattle (D1 Batch)
```javascript
// Use D1 batch for atomic operations
await env.DB.batch([
  env.DB.prepare(
    `INSERT INTO vitals (id, cattle_id, temperature, respiratory_rate, humidity, heart_rate, stress_index, stress_level)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, cattleId, temp, resp, humidity, hr, score, level),

  env.DB.prepare(
    `UPDATE cattle SET stress_level = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(level, cattleId),
]);
```

## Migration Notes (from old backend)
- **Old formula**: Breed-specific normalized strain index (MongoDB embedded docs)
- **New formula**: Universal threshold-based scoring with 4 vitals
- **Old storage**: Embedded array in cattle document → **New**: Separate `vitals` table in D1
- **Old levels**: 3 with overlapping ranges → **New**: 5 with clean boundaries
- **D1 batch**: Used for atomic vitals insert + cattle stress update
