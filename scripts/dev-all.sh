#!/usr/bin/env bash
# Levanta core (Nest :5080) y app (Next :5081) en paralelo.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ROOT/core/.env" ]]; then
  echo "[dev] falta core/.env — ejecuta: npm run env:dev"
  exit 1
fi
if [[ ! -f "$ROOT/app/.env.local" ]]; then
  echo "[dev] falta app/.env.local — ejecuta: npm run env:dev"
  exit 1
fi

exec npx concurrently \
  --kill-others-on-fail \
  --names "core,app" \
  --prefix-colors "cyan,magenta" \
  "npm run start:dev --workspace=core" \
  "npm run dev --workspace=app"
