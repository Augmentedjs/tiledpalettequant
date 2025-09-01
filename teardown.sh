#!/usr/bin/env bash
# Teardown for tiledpalettequant
# - Uses docker compose down --rmi local --volumes --remove-orphans
# - Works with both "docker compose" (v2) and "docker-compose" (v1)
# - Auto-discovers a compose file; override with TPQ_COMPOSE=/abs/path.yml
# - Optional extras:
#     TPQ_RM_CONTAINERS=1   (force rm known containers if any remain)
#     TPQ_PRUNE=1           (docker system prune -f after teardown)

set -Eeuo pipefail

log() { printf '%s %s\n' "$1" "$2"; }
info() { log "[info]" "$*"; }
ok()   { log "[ok] " "$*"; }
warn() { log "[warn]" "$*"; }
die()  { log "[err]" "$*"; exit 1; }

# --- pick compose binary ---
COMPOSE_CMD=""
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  die "Neither 'docker compose' nor 'docker-compose' found."
fi

# --- locate compose file ---
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$ROOT"

if [[ -n "${TPQ_COMPOSE:-}" ]]; then
  FILE="$TPQ_COMPOSE"
else
  for f in \
    "./docker-compose.yml" "./docker-compose.yaml" \
    "./compose.yml" "./compose.yaml" \
    "./ui/docker-compose.yml" "./ui/compose.yml" \
    "./ops/docker-compose.yml" "./ops/compose.yml" \
    "./docker/docker-compose.yml" "./docker/compose.yml"
  do
    [[ -f "$f" ]] && FILE="$f" && break
  done
fi

[[ -z "${FILE:-}" ]] && die "No compose file found. Set TPQ_COMPOSE=/path/to/compose.yml and re-run."
COMPOSE_DIR="$(cd -- "$(dirname "$FILE")" && pwd -P)"
COMPOSE_BASENAME="$(basename "$FILE")"

info "Using compose file: $COMPOSE_DIR/$COMPOSE_BASENAME"
pushd "$COMPOSE_DIR" >/dev/null

# --- bring everything down, remove local images & volumes ---
info "docker compose down --rmi local --volumes --remove-orphans"
set +e
$COMPOSE_CMD -f "$COMPOSE_BASENAME" down --rmi local --volumes --remove-orphans
STATUS=$?
set -e
popd >/dev/null

if [[ $STATUS -ne 0 ]]; then
  warn "compose down exited with code $STATUS (continuing with best-effort cleanup)"
fi

# --- optional: force-remove known containers if any linger ---
if [[ "${TPQ_RM_CONTAINERS:-0}" == "1" ]]; then
  # If your compose sets container_name, you can list them here:
  # (adjust these if you’ve changed names)
  for c in tpq-service tpq-ui; do
    if docker ps -a --format '{{.Names}}' | grep -qx "$c"; then
      info "Removing lingering container: $c"
      docker rm -f "$c" || warn "Failed to remove $c"
    fi
  done
fi

# --- optional: prune dangling images/networks systemwide ---
if [[ "${TPQ_PRUNE:-0}" == "1" ]]; then
  info "Pruning dangling images/networks/volumes (docker system prune -f)"
  docker system prune -f || warn "Prune failed (non-fatal)"
fi

ok "Teardown complete."
