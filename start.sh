#!/usr/bin/env bash
set -e
set -u
set -o pipefail

# Require bash
if [[ -z "${BASH_VERSION:-}" ]]; then
  echo "[error] Please run with bash:  bash ./start.sh" >&2
  exit 1
fi

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$here"
cd "$repo_root"

# Compose shim
if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "[error] Docker Compose not found." >&2
  exit 1
fi

# Defaults & args
mode="dev"       # dev | prod
rebuild="no"
logs="no"
open_browser="no"
port="${PORT:-8080}"

usage() {
  cat <<EOF
Usage: ./start.sh [options]

Options:
  --prod            Use the 'prod' profile (builds image; no bind mount)
  --rebuild         Pass --build to Compose
  --port <num>      Port to expose (default: ${port})
  --logs            Follow logs after start
  --open            Open http://localhost:<port> in a browser (macOS 'open')
  -h, --help        Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prod) mode="prod"; shift ;;
    --rebuild) rebuild="yes"; shift ;;
    --port) port="$2"; shift 2 ;;
    --logs) logs="yes"; shift ;;
    --open) open_browser="yes"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "[error] Unknown arg: $1" >&2; usage; exit 1 ;;
  esac
done

# Sanity checks
[[ -f docker-compose.yml ]] || { echo "[error] docker-compose.yml not found."; exit 1; }
[[ -f nginx.conf ]] || { echo "[error] nginx.conf not found in repo root."; exit 1; }
[[ "$mode" == "prod" && ! -f Dockerfile ]] && { echo "[error] Dockerfile required for --prod."; exit 1; }

# Warn if port in use
if command -v lsof >/dev/null 2>&1 && lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "[warn] Port $port already in use; continuing anyway…"
fi

export PORT="$port"

# Build flag (string, not array) — avoids empty-array + set -u issues on macOS bash 3.2
BUILD=""
[[ "$rebuild" == "yes" ]] && BUILD="--build"

if [[ "$mode" == "prod" ]]; then
  echo "[info] Starting PROD on http://localhost:${PORT}"
  if [[ -n "$BUILD" ]]; then
    "${COMPOSE[@]}" --profile prod up "$BUILD" -d
  else
    "${COMPOSE[@]}" --profile prod up -d
  fi
else
  echo "[info] Starting DEV (bind-mount) on http://localhost:${PORT}"
  if [[ -n "$BUILD" ]]; then
    "${COMPOSE[@]}" up "$BUILD" -d
  else
    "${COMPOSE[@]}" up -d
  fi
fi

url="http://localhost:${PORT}"
echo "[ok] Up. Open: ${url}"

if [[ "$open_browser" == "yes" && "$OSTYPE" == darwin* ]]; then
  open "$url" || true
fi

if [[ "$logs" == "yes" ]]; then
  svc=$([[ "$mode" == "prod" ]] && echo "prod" || echo "web")
  "${COMPOSE[@]}" logs -f --tail=50 "$svc"
fi
