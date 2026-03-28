# Contributing to VKAS

Thank you for your interest in contributing! This guide covers everything you need to get started.

## Repository layout

```
packages/vkas/        # The library (published to npm as "vkas")
playground/           # Interactive demo app (Vite + Vue 3)
docs/                 # Documentation site (VitePress)
vendor/               # Local kaspa-wasm build
dev.sh                # One-command dev environment
```

## Prerequisites

- **Node.js** 18+
- **pnpm** 9+ — `npm install -g pnpm`

## Setup

```bash
git clone https://github.com/furatamasensei/vkas.git
cd vkas
pnpm install
```

## Development

```bash
# Start playground + docs (both in background, terminal stays free)
./dev.sh

# Check what's running and on which ports
./dev.sh status

# Follow live output
./dev.sh logs          # all servers
./dev.sh logs playground
./dev.sh logs docs

# Stop everything
./dev.sh stop
```

### Available commands

| Command | Description |
|---|---|
| `./dev.sh` or `./dev.sh all` | Start playground + docs in background |
| `./dev.sh dev` | Start playground only |
| `./dev.sh docs` | Start docs only |
| `./dev.sh rebuild` | Rebuild library and restart servers |
| `./dev.sh stop` | Stop all background servers |
| `./dev.sh status` | Show running servers and PIDs |
| `./dev.sh logs [name]` | Tail server logs |
| `./dev.sh test` | Run test suite once |
| `./dev.sh test:watch` | Run tests in watch mode |
| `./dev.sh build` | Build the library |
| `./dev.sh docs:build` | Build the docs site |
| `./dev.sh ci` | Full pipeline: test → build → playground build |

## Project structure

```
packages/vkas/
├── src/
│   ├── composables/     # useKaspa, useRpc, useUtxo, useTransaction, useCrypto, useNetwork
│   ├── devtools/        # Vue DevTools inspector + timeline
│   ├── internal/        # wasm-loader, rpc-manager, event-bridge (singletons)
│   ├── plugin.ts        # KaspaPlugin
│   ├── nuxt.ts          # Nuxt 3 module
│   ├── types.ts         # All exported TypeScript types
│   ├── errors.ts        # KaspaError hierarchy
│   └── index.ts         # Public API
├── tests/
│   ├── unit/            # Unit tests (vitest)
│   └── integration/     # Plugin integration tests
└── dist/                # Build output (generated)
```

## Testing

```bash
./dev.sh test          # run once
./dev.sh test:watch    # watch mode
```

Tests use [Vitest](https://vitest.dev) with `happy-dom`. The `kaspa-wasm` module is mocked in `tests/mocks/kaspa-wasm.ts`.

When adding a new feature:
1. Add unit tests in `packages/vkas/tests/unit/`
2. If the feature touches plugin installation, add integration tests in `tests/integration/`
3. All tests must pass before a PR can be merged

## Adding a composable

1. Create `packages/vkas/src/composables/useYourComposable.ts`
2. Add the return type interface to `src/types.ts`
3. Export from `src/index.ts`
4. Register for auto-import in `src/nuxt.ts`
5. Write tests in `tests/unit/useYourComposable.test.ts`
6. Add a documentation page at `docs/composables/your-composable.md`
7. Add it to the sidebar in `docs/.vitepress/config.ts`

## Documentation

The docs site lives in `docs/` and is built with [VitePress](https://vitepress.dev).

```bash
./dev.sh docs          # dev server with hot reload
./dev.sh docs:build    # production build → docs/.vitepress/dist/
```

When changing or adding public API:
- Update the relevant page in `docs/composables/` or `docs/guide/`
- Update `docs/reference/types.md` if types changed
- Update `docs/public/llms.txt` and `docs/public/llms-full.txt`

## Pull requests

1. Fork the repo and create a branch from `main`
2. Make your changes with tests
3. Run `./dev.sh ci` to verify the full pipeline passes
4. Open a PR with a clear description of what changed and why

### Commit style

```
type: short description

feat:     new feature
fix:      bug fix
chore:    tooling, deps, config
docs:     documentation only
refactor: code change with no behavior change
test:     adding or fixing tests
```

## Reporting bugs

Open an issue on GitHub with:
- What you expected to happen
- What actually happened
- A minimal reproduction (code snippet or repo link)
- Your environment: `node --version`, `pnpm --version`, browser, OS

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
