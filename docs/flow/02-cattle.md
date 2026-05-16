# Module: Cattle Management

## Overview
CRUD operations for cattle records. Each cattle belongs to a user and tracks breed, vitals, and stress over time.

## D1 Database Schema

```sql
CREATE TABLE cattle (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  breed TEXT NOT NULL CHECK (breed IN ('zebu', 'crossBreed', 'murrah')),
  age INTEGER NOT NULL,
  weight REAL NOT NULL,
  ear_tag TEXT NOT NULL,
  image_url TEXT,
  stress_level TEXT DEFAULT 'none' CHECK (stress_level IN ('none', 'mild', 'moderate', 'severe', 'danger')),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_cattle_user_id ON cattle(user_id);
CREATE INDEX idx_cattle_stress ON cattle(stress_level);
CREATE INDEX idx_cattle_name ON cattle(name);
```

## REST API Endpoints

### Queries
| Method | Path | Input | Output | Auth |
|--------|------|-------|--------|------|
| `GET` | `/api/cattle` | query param: `?search=` | `[Cattle]` | ✅ Yes |
| `GET` | `/api/cattle/:id` | — | `Cattle` (with latest vitals) | ✅ Yes |

### Mutations
| Method | Path | Input (JSON Body) | Output | Auth |
|--------|------|-------------------|--------|------|
| `POST` | `/api/cattle` | `{ name, breed, age, weight, earTag, imageUrl? }` | `Cattle` | ✅ Yes |
| `PUT` | `/api/cattle/:id` | `{ name, breed, age, weight, earTag, imageUrl? }` | `Cattle` | ✅ Yes |
| `DELETE` | `/api/cattle/:id` | — | `{ success: true }` | ✅ Yes |

## Flows

### Cattle List Flow
```
1. User lands on Cattle List screen (home)
2. GET /api/cattle (sorted by stress level desc — danger first)
3. Response includes latest vitals via JOIN or subquery
4. Display as cards showing:
   - Name, breed, ear tag
   - Latest temperature + respiratory rate
   - Color-coded stress badge
5. + FAB button → Create Cattle (Form)
6. Tap card → Cattle Detail screen
```

### Create Cattle Flow (Simple Form)
```
1. User taps + FAB button
2. Opens Add Cattle form screen
3. Form fields:
   ┌─────────────────────────────┐
   │  🐄 Add New Cattle           │
   │                              │
   │  ┌───────────────────────┐   │
   │  │                       │   │
   │  │   📷 Tap to add photo │   │  ← camera / gallery picker
   │  │                       │   │
   │  └───────────────────────┘   │
   │                              │
   │  Name:     [  Lakshmi     ]  │  ← text input
   │  Breed:    [ Zebu ▼       ]  │  ← dropdown picker (zebu/crossBreed/murrah)
   │  Age:      [ 3        ] yrs  │  ← number pad
   │  Weight:   [ 450      ] kg   │  ← number pad
   │  Ear Tag:  [ ET-042      ]   │  ← text input
   │                              │
   │  [ ✅ Add to Herd ]          │  ← big green button (48px+ height)
   └─────────────────────────────┘
4. Client-side validation (all fields required except photo, breed must be valid enum)
5. Submit → POST /api/cattle
6. Success toast → Navigate back to Cattle List (new cattle appears)
```

**Why form over chat**: Target users are farmers with limited tech experience.
A form with big inputs, pickers, and number pads is faster and less error-prone
than a multi-message AI conversation for 5 fixed fields.

### Cattle Photo Upload
```
1. Farmer taps photo area → action sheet: "Take Photo" / "Choose from Gallery"
2. Uses expo-image-picker (camera or media library)
3. Image resized client-side (max 800px, JPEG 80% quality)
4. Upload to Cloudflare R2 bucket: PUT /api/upload/cattle-image
5. Returns imageUrl → attached to POST /api/cattle body
6. If skipped → default placeholder icon (🐄) shown in list/detail
```

### Search Flow
```
1. User types in search bar
2. GET /api/cattle?search=lakshmi
3. D1 query: WHERE name LIKE '%lakshmi%' AND user_id = ?
4. Return matching cattle
```

### Delete Cattle Flow
```
1. User swipes or long-presses cattle card
2. Confirmation dialog
3. DELETE /api/cattle/:id
4. Cascade deletes vitals_history records
5. Remove from list
```

## Cattle List Card Display
```
┌─────────────────────────────┐
│ ┌─────┐                     │
│ │ 📷  │ Lakshmi      [🔴]  │
│ │     │ Zebu  |  Tag: A-042 │
│ └─────┘ 🌡️ 39.2°C  💨 55  │
└─────────────────────────────┘
```
- Photo thumbnail (48x48, rounded) or 🐄 placeholder if no image

## SQL Query Examples

### List all cattle with latest vitals
```sql
SELECT c.*,
  v.temperature, v.respiratory_rate, v.humidity, v.heart_rate,
  v.stress_index, v.recorded_at
FROM cattle c
LEFT JOIN vitals v ON v.id = (
  SELECT id FROM vitals WHERE cattle_id = c.id ORDER BY recorded_at DESC LIMIT 1
)
WHERE c.user_id = ?
ORDER BY
  CASE c.stress_level
    WHEN 'danger' THEN 0
    WHEN 'severe' THEN 1
    WHEN 'moderate' THEN 2
    WHEN 'mild' THEN 3
    ELSE 4
  END;
```

## Migration Notes (from old backend)
- **MongoDB → D1**: Embedded documents → separate `vitals` table with foreign key
- **Added**: `ear_tag` field
- **Renamed**: `category` → `breed`
- **Removed**: embedded `latestObservation` / `observation` arrays (now in `vitals` table)
- **Added**: `stress_level` column (computed on vitals insert)
