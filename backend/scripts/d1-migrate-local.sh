#!/bin/bash
# Idempotent migrations for the local D1 database.
# Each step is allowed to fail (e.g. "duplicate column name") since
# SQLite's ALTER TABLE has no IF NOT EXISTS clause.

set -u

run() {
  local desc="$1"; shift
  local sql="$1"; shift
  echo "→ $desc"
  if wrangler d1 execute cattle-care-db --local --command "$sql" >/dev/null 2>&1; then
    echo "  ok"
  else
    echo "  skipped (already applied or column missing)"
  fi
}

# 2026-05: cattle gains an image_url column (R2 upload pipeline)
run "Add cattle.image_url" "ALTER TABLE cattle ADD COLUMN image_url TEXT;"

# 2026-05: users gain a password_hash column (email/password auth)
run "Add users.password_hash" "ALTER TABLE users ADD COLUMN password_hash TEXT;"

echo "All migrations attempted."
