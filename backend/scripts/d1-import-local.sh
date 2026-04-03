#!/bin/bash
set -e

# Order matters: users first (sessions has FK → users)
SCHEMAS=(
  src/db/users/schema.sql
  src/db/sessions/schema.sql
  src/db/cattle/schema.sql
  src/db/vitals/schema.sql
)

for SCHEMA in "${SCHEMAS[@]}"; do
  echo "Importing: $SCHEMA"
  wrangler d1 execute cattle-care-db --local --file "$SCHEMA"
done

echo "All schemas imported."
