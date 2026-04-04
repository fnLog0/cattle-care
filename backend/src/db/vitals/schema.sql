CREATE TABLE IF NOT EXISTS vitals (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  cattle_id TEXT NOT NULL REFERENCES cattle(id) ON DELETE CASCADE,
  body_temperature REAL NOT NULL,
  respiratory_rate REAL NOT NULL,
  heart_rate REAL,
  ambient_temperature REAL NOT NULL,
  humidity REAL NOT NULL,
  stress_index REAL NOT NULL,
  stress_level TEXT NOT NULL CHECK (stress_level IN ('none', 'mild', 'moderate', 'severe', 'danger')),
  recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_vitals_cattle_id ON vitals(cattle_id);
CREATE INDEX IF NOT EXISTS idx_vitals_recorded_at ON vitals(cattle_id, recorded_at DESC);
