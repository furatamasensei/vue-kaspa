#!/usr/bin/env bash
# dev.sh — one command to start the full dev environment
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}▶${NC} $*"; }
success() { echo -e "${GREEN}✓${NC} $*"; }
warn()    { echo -e "${YELLOW}!${NC} $*"; }
die()     { echo -e "${RED}✗${NC} $*"; exit 1; }

PIDS_DIR="$ROOT/.dev-pids"
LOGS_DIR="$ROOT/.dev-logs"
mkdir -p "$PIDS_DIR" "$LOGS_DIR"

# ── helpers ───────────────────────────────────────────────────────────────────
start_service() {
  local name="$1"; shift          # e.g. "playground"
  local pid_file="$PIDS_DIR/$name.pid"
  local log_file="$LOGS_DIR/$name.log"

  # Kill any previous instance for this service
  if [[ -f "$pid_file" ]]; then
    local old_pid
    old_pid=$(cat "$pid_file")
    kill "$old_pid" 2>/dev/null && warn "Stopped previous $name (pid $old_pid)"
    rm -f "$pid_file"
  fi

  # Start detached
  "$@" > "$log_file" 2>&1 &
  local pid=$!
  echo "$pid" > "$pid_file"

  # Wait up to 10s for the server URL to appear in the log
  local url="" elapsed=0
  while [[ -z "$url" && $elapsed -lt 10 ]]; do
    sleep 0.5
    elapsed=$((elapsed + 1))
    url=$(grep -o 'http://localhost:[0-9]*' "$log_file" 2>/dev/null | head -1)
  done

  if [[ -n "$url" ]]; then
    success "$name → $url  (pid $pid, log: .dev-logs/$name.log)"
  else
    warn "$name started but URL not detected yet (pid $pid, log: .dev-logs/$name.log)"
  fi
}

stop_service() {
  local name="$1"
  local pid_file="$PIDS_DIR/$name.pid"
  if [[ -f "$pid_file" ]]; then
    local pid
    pid=$(cat "$pid_file")
    kill "$pid" 2>/dev/null && success "Stopped $name (pid $pid)" || warn "$name was not running"
    rm -f "$pid_file"
  else
    warn "$name is not running"
  fi
}

is_running() {
  local name="$1"
  local pid_file="$PIDS_DIR/$name.pid"
  [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null
}

# ── pnpm check ────────────────────────────────────────────────────────────────
command -v pnpm &>/dev/null || die "pnpm not found. Run: npm install -g pnpm"

# ── auto-install if node_modules is missing or lock file is newer ─────────────
needs_install() {
  [[ ! -d "$ROOT/node_modules" ]] && return 0
  [[ ! -d "$ROOT/packages/vue-kaspa/node_modules" ]] && return 0
  [[ ! -d "$ROOT/playground/node_modules" ]] && return 0
  [[ ! -d "$ROOT/docs/node_modules" ]] && return 0
  [[ "$ROOT/pnpm-lock.yaml" -nt "$ROOT/node_modules/.modules.yaml" ]] && return 0
  return 1
}

if needs_install; then
  info "Installing dependencies..."
  pnpm install
  success "Dependencies ready."
fi

# ── mode ──────────────────────────────────────────────────────────────────────
MODE="${1:-all}"

case "$MODE" in
  dev)
    start_service playground pnpm --filter playground dev
    ;;

  docs)
    start_service docs pnpm --filter docs dev
    ;;

  all)
    start_service playground pnpm --filter playground dev
    start_service docs pnpm --filter docs dev
    echo ""
    info "Tail logs  → ./dev.sh logs"
    info "Stop all   → ./dev.sh stop"
    ;;

  stop)
    TARGET="${2:-}"
    if [[ -n "$TARGET" ]]; then
      stop_service "$TARGET"
    else
      stop_service playground
      stop_service docs
    fi
    ;;

  status)
    for name in playground docs; do
      if is_running "$name"; then
        pid=$(cat "$PIDS_DIR/$name.pid")
        echo -e "${GREEN}●${NC} $name  (pid $pid)"
      else
        echo -e "${RED}○${NC} $name  (not running)"
      fi
    done
    ;;

  logs)
    TARGET="${2:-}"
    if [[ -n "$TARGET" ]]; then
      [[ -f "$LOGS_DIR/$TARGET.log" ]] || die "No log found for $TARGET"
      tail -f "$LOGS_DIR/$TARGET.log"
    else
      # Interleave both logs with a prefix using tail -f on multiple files
      tail -f "$LOGS_DIR"/playground.log "$LOGS_DIR"/docs.log 2>/dev/null \
        || die "No logs found. Run ./dev.sh all first."
    fi
    ;;

  docs:build)
    info "Building docs..."
    pnpm --filter docs build
    success "Docs built → docs/.vitepress/dist/"
    ;;

  test)
    info "Running tests..."
    pnpm --filter vue-kaspa test
    success "All tests passed."
    ;;

  test:watch)
    info "Tests in watch mode (Ctrl+C to exit)..."
    pnpm --filter vue-kaspa test:watch
    ;;

  build)
    info "Building vue-kaspa library..."
    pnpm --filter vue-kaspa build
    success "Built → packages/vue-kaspa/dist/"
    ;;

  ci)
    # Full pipeline: test → build → playground build (no server)
    info "Running tests..."
    pnpm --filter vue-kaspa test
    success "Tests passed."
    info "Building library..."
    pnpm --filter vue-kaspa build
    success "Library built."
    info "Building playground..."
    pnpm --filter playground build
    success "Playground built → playground/dist/"
    ;;

  *)
    echo "Usage: ./dev.sh [command] [target]"
    echo ""
    echo "  all              start playground + docs in background (default)"
    echo "  dev              start playground only"
    echo "  docs             start docs only"
    echo "  stop [name]      stop all servers, or a specific one"
    echo "  status           show which servers are running"
    echo "  logs [name]      tail logs for all servers, or a specific one"
    echo "  docs:build       build the docs site"
    echo "  test             run tests once"
    echo "  test:watch       run tests in watch mode"
    echo "  build            build the library"
    echo "  ci               test + build library + build playground"
    exit 1
    ;;
esac
