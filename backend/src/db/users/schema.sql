CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  phone TEXT UNIQUE,
  google_id TEXT UNIQUE,
  email TEXT UNIQUE COLLATE NOCASE,
  password_hash TEXT,
  full_name TEXT,
  profile_image TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'notActive', 'banned')),
  phone_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
