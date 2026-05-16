CREATE TABLE IF NOT EXISTS vitals (
  id TEXT PRIMARY KEY,
  cattle_id TEXT NOT NULL REFERENCES cattle(id) ON DELETE CASCADE,
  rectal_temperature REAL NOT NULL,
  respiration_rate REAL NOT NULL,
  strain_index REAL NOT NULL,
  stress_level TEXT NOT NULL CHECK (stress_level IN ('none', 'mild', 'moderate', 'severe', 'danger')),
  recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_vitals_cattle_recorded
  ON vitals(cattle_id, recorded_at);
