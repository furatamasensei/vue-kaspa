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

# ── pnpm check ───────────────────────────────────────────────────────────────
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

# ── mode ─────────────────────────────────────────────────────────────────────
MODE="${1:-dev}"

case "$MODE" in
  dev)
    info "Starting playground at http://localhost:5173"
    info "vue-kaspa source is aliased directly — edits hot-reload instantly"
    info "Press Ctrl+C to stop"
    echo ""
    pnpm --filter playground dev
    ;;

  docs)
    info "Starting docs dev server..."
    info "Press Ctrl+C to stop"
    echo ""
    pnpm --filter docs dev
    ;;

  docs:build)
    info "Building docs..."
    pnpm --filter docs build
    success "Docs built → docs/.vitepress/dist/"
    ;;

  all)
    info "Starting playground + docs in parallel..."
    info "Press Ctrl+C to stop both"
    echo ""
    pnpm --filter playground dev &
    PLAYGROUND_PID=$!
    pnpm --filter docs dev &
    DOCS_PID=$!
    trap "kill $PLAYGROUND_PID $DOCS_PID 2>/dev/null" INT TERM
    wait
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
    echo "Usage: ./dev.sh [dev|docs|docs:build|all|test|test:watch|build|ci]"
    echo ""
    echo "  dev         start playground dev server (default)"
    echo "  docs        start docs dev server"
    echo "  docs:build  build the docs site"
    echo "  all         start playground + docs in parallel"
    echo "  test        run tests once"
    echo "  test:watch  run tests in watch mode"
    echo "  build       build the library"
    echo "  ci          test + build library + build playground"
    exit 1
    ;;
esac
