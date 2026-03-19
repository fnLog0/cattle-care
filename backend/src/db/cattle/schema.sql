CREATE TABLE IF NOT EXISTS cattle (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT NOT NULL CHECK (breed IN ('zebu', 'crossBreed', 'murrah')),
  age REAL NOT NULL,
  weight REAL NOT NULL,
  ear_tag TEXT NOT NULL UNIQUE,
  stress_level TEXT NOT NULL DEFAULT 'none' CHECK (stress_level IN ('none', 'mild', 'moderate', 'severe', 'danger')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cattle_user_id ON cattle(user_id);
CREATE INDEX IF NOT EXISTS idx_cattle_ear_tag ON cattle(ear_tag);
