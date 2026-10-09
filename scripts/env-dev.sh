#!/usr/bin/env bash
# Proyecta envs → core/.env y app/.env.local
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENVS="$ROOT/envs"
FORCE=false

for arg in "$@"; do
  case "$arg" in
    --force|-f) FORCE=true ;;
    --help|-h)
      echo "Uso: $0 [--force]"
      exit 0
      ;;
  esac
done

if [[ -f "$ENVS/shared.env" ]]; then
  SHARED="$ENVS/shared.env"
elif [[ -f "$ENVS/shared.env.example" ]]; then
  SHARED="$ENVS/shared.env.example"
else
  echo "[env-dev] falta envs/shared.env.example" >&2
  exit 1
fi

write_if_needed() {
  local dest="$1"
  local label="$2"
  shift 2
  if [[ -f "$dest" && "$FORCE" != true ]]; then
    echo "[env-dev] ya existe $dest (usa --force para regenerar)"
    return 0
  fi
  {
    echo "# Generado por scripts/env-dev.sh — no editar a mano en git"
    echo "# Fuente: $(basename "$SHARED") + $label"
    echo ""
    cat "$@"
  } > "$dest"
  echo "[env-dev] escrito $dest"
}

# core/.env = shared + core fragment
CORE_TMP="$(mktemp)"
{
  cat "$SHARED"
  if [[ -f "$ENVS/core.env.example" ]]; then
    echo ""
    cat "$ENVS/core.env.example"
  fi
} > "$CORE_TMP"
write_if_needed "$ROOT/core/.env" "core.env.example" "$CORE_TMP"
rm -f "$CORE_TMP"

# app/.env.local = shared keys útiles + app fragment
APP_TMP="$(mktemp)"
{
  # Derivar API URL del puerto del core si no viene en fragment
  echo "NODE_ENV=development"
  if [[ -f "$ENVS/app.env.local.example" ]]; then
    cat "$ENVS/app.env.local.example"
  else
    echo "PORT=5081"
    echo "NEXT_PUBLIC_API_URL=http://localhost:5080"
  fi
} > "$APP_TMP"
write_if_needed "$ROOT/app/.env.local" "app.env.local.example" "$APP_TMP"
rm -f "$APP_TMP"
