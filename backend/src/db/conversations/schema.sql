CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cattle_id TEXT NOT NULL REFERENCES cattle(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL DEFAULT 'health' CHECK (agent_type IN ('health')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, cattle_id, agent_type)
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_cattle
  ON conversations(user_id, cattle_id);
