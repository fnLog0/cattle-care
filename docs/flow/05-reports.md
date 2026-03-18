# Module: Reports

## Overview
Herd-level analytics and historical data accessible from the bottom navigation "Reports" tab. All queries run on Cloudflare D1.

## Features

### Herd Summary Dashboard
```
┌──────────────────────────────────┐
│ 🐄 Herd Overview                 │
│                                  │
│ Total Cattle: 24                 │
│ ✅ Healthy: 15  🟡 Mild: 5       │
│ 🟠 Moderate: 2  🔴 Severe: 1     │
│ ⛔ Danger: 1                     │
└──────────────────────────────────┘
```

### Stress Distribution
- Breakdown of herd by stress level (pie/bar chart)
- Count + percentage per level

### At-Risk Animals
- List of cattle with stress level ≥ moderate
- Sorted by severity (danger first)
- Quick tap → goes to Cattle Detail

### Historical Trends
- Per-cattle vital trends over time (line charts)
- Temperature, respiratory rate, humidity, heart rate
- Filterable by date range (7d, 30d, 90d)

## REST API Endpoints

### Queries
| Method | Path | Input | Output | Auth |
|--------|------|-------|--------|------|
| `GET` | `/api/reports/summary` | — | `HerdSummary` | ✅ Yes |
| `GET` | `/api/reports/at-risk` | — | `[Cattle]` | ✅ Yes |
| `GET` | `/api/cattle/:id/vitals` | `?range=7d\|30d\|90d` | `[Vitals]` | ✅ Yes |

### Response Types
```json
// HerdSummary
{
  "totalCattle": 24,
  "stressDistribution": {
    "none": 15,
    "mild": 5,
    "moderate": 2,
    "severe": 1,
    "danger": 1
  }
}
```

## SQL Query Examples

### Herd Summary
```sql
SELECT
  COUNT(*) as total_cattle,
  SUM(CASE WHEN stress_level = 'none' THEN 1 ELSE 0 END) as none,
  SUM(CASE WHEN stress_level = 'mild' THEN 1 ELSE 0 END) as mild,
  SUM(CASE WHEN stress_level = 'moderate' THEN 1 ELSE 0 END) as moderate,
  SUM(CASE WHEN stress_level = 'severe' THEN 1 ELSE 0 END) as severe,
  SUM(CASE WHEN stress_level = 'danger' THEN 1 ELSE 0 END) as danger
FROM cattle
WHERE user_id = ?;
```

### At-Risk Cattle
```sql
SELECT c.*, v.temperature, v.respiratory_rate, v.humidity, v.heart_rate
FROM cattle c
LEFT JOIN vitals v ON v.id = (
  SELECT id FROM vitals WHERE cattle_id = c.id ORDER BY recorded_at DESC LIMIT 1
)
WHERE c.user_id = ?
  AND c.stress_level IN ('moderate', 'severe', 'danger')
ORDER BY
  CASE c.stress_level
    WHEN 'danger' THEN 0
    WHEN 'severe' THEN 1
    WHEN 'moderate' THEN 2
  END;
```

### Vitals History (with date range)
```sql
SELECT * FROM vitals
WHERE cattle_id = ?
  AND recorded_at >= datetime('now', '-7 days')
ORDER BY recorded_at ASC;
```

## Migration Notes
- **New module** — no equivalent in old backend
- Replaces old `getRisks` query (which had overlapping ranges)
- All aggregation done via D1 SQL (efficient at edge)
