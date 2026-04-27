#!/usr/bin/env bash
# Run all SQL files in supabase/migrations/ in lexical order (001 → 002 → …).
# Requires: psql (brew install libpq && brew link --force libpq)
# Requires: DATABASE_URL — Supabase Dashboard → Project Settings → Database → URI.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATIONS="$ROOT/supabase/migrations"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: set DATABASE_URL to your Supabase Postgres connection string."
  echo "  Dashboard → Project Settings → Database → Connection string (URI)."
  echo "  Then: npm run db:migrate"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "Error: psql not found. macOS: brew install libpq && brew link --force libpq"
  exit 1
fi

count=0
while IFS= read -r f; do
  echo "→ $f"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
  count=$((count + 1))
done < <(find "$MIGRATIONS" -maxdepth 1 -name "*.sql" | sort)

if [ "$count" -eq 0 ]; then
  echo "No .sql files in $MIGRATIONS"
  exit 1
fi

echo "Done ($count files)."
