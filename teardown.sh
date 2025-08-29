#!/usr/bin/env bash
# Portable teardown that works even if the compose file moved/was deleted.
set -e
set -u
set -o pipefail

if [[ -z "${BASH_VERSION:-}" ]]; then
  echo "[error] Please run with bash:  bash ./teardown.sh" >&2
  exit 1
fi

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$here"
cd "$repo_root"

# Figure out compose command
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  COMPOSE_CMD=""
fi

remove_volumes="no"
remove_images="no"
prune="no"

usage() {
  cat <<EOF
Usage: ./teardown.sh [options]

Stops and removes containers for this project.

Options:
  --volumes   Also remove volumes (compose mode only)
  --images    Remove images built by compose (compose mode only; --rmi local)
  --prune     After cleanup, run 'docker system prune -f' (dangling only)
  -h, --help  Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --volumes) remove_volumes="yes"; shift ;;
    --images)  remove_images="yes";  shift ;;
    --prune)   prune="yes";          shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "[error] Unknown arg: $1" >&2; usage; exit 1 ;;
  esac
done

# Detect a compose file
COMPOSE_FILE=""
for f in docker-compose.yml docker-compose.yaml compose.yaml; do
  if [[ -f "$f" ]]; then COMPOSE_FILE="$f"; break; fi
done

if [[ -n "$COMPOSE_CMD" && -n "$COMPOSE_FILE" ]]; then
  # Compose-aware teardown
  cmd="$COMPOSE_CMD -f $COMPOSE_FILE down"
  [[ "$remove_volumes" == "yes" ]] && cmd="$cmd --volumes"
  [[ "$remove_images" == "yes"  ]] && cmd="$cmd --rmi local"
  echo "[info] $cmd"
  eval "$cmd" || true
else
  # Fallback: direct cleanup (no compose file found)
  echo "[info] No compose file found; performing direct cleanup…"
  # Known container names from the compose I gave you
  docker rm -f tpq-web tpq-prod >/dev/null 2>&1 || true

  # Also remove containers for this repo's default compose project (label)
  PROJECT="$(basename "$repo_root")"
  ids="$(docker ps -aq -f "label=com.docker.compose.project=$PROJECT")"
  if [[ -n "${ids:-}" ]]; then
    echo "[info] removing containers with label com.docker.compose.project=$PROJECT"
    docker rm -f $ids >/dev/null 2>&1 || true
  fi

  # Remove default network if present
  net="${PROJECT}_default"
  docker network rm "$net" >/dev/null 2>&1 || true
fi

if [[ "$prune" == "yes" ]]; then
  echo "[info] docker system prune -f (dangling only)"
  docker system prune -f >/dev/null || true
fi

echo "[ok] Teardown complete."
