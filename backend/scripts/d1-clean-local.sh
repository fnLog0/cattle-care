#!/bin/bash
set -e

TABLES=(vitals sessions cattle users)

for TABLE in "${TABLES[@]}"; do
  echo "Dropping table: $TABLE"
  wrangler d1 execute cattle-care-db --local --command "DROP TABLE IF EXISTS $TABLE;"
done

echo "All tables dropped."
