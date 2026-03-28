# Changelog

## v0.1.2

### Bug fixes

- **WASM class name preservation** — `@vue-kaspa/kaspa-wasm` now works correctly in minified production builds. wasm-bindgen validates passed JS objects by checking `obj.constructor.name` at runtime; standard bundler minification was renaming all 76 WASM-backed classes to `class e`, causing `"object constructor 'e' does not match expected class 'Resolver'"` errors. The vendor package now calls `Object.defineProperty(ClassName, 'name', { value: 'ClassName' })` after each class definition — string literals survive minification and restore the correct name after class renaming. No user configuration required.

---

## v0.1.1

### Bug fixes

- **Centralized WASM singleton** — all internal modules now access `@vue-kaspa/kaspa-wasm` through a single `loadKaspa()` / `getKaspa()` helper stored on `globalThis`. This prevents class identity mismatches when a bundler emits the kaspa-wasm bindings into more than one chunk.
- **Package rename** — underlying WASM bindings package renamed to `@vue-kaspa/kaspa-wasm` (scoped, matches the monorepo).

---

## v0.1.0

Initial release.

### Features

**Vue Plugin + Nuxt Module**
- `KaspaPlugin` for Vue 3 with full `KaspaPluginOptions` configuration
- Nuxt 3 module (`vue-kaspa/nuxt`) with auto-imports and SSR safety
- Vue DevTools integration — inspector panel and event timeline

**Composables**
- `useKaspa` — WASM initialization lifecycle with status tracking
- `useRpc` — WebSocket RPC connection, 12 query methods, event subscriptions
- `useUtxo` — Real-time UTXO tracking, reactive balance, auto-cleanup on unmount
- `useTransaction` — `estimate()`, `create()`, `send()` with UTXO compounding support
- `useCrypto` — BIP-39 mnemonic, BIP-32 HD derivation, signing, unit conversion
- `useNetwork` — Network switching with auto-reconnect

**Supported networks**
- `mainnet`, `testnet-10`, `testnet-11`, `simnet`, `devnet`

**TypeScript**
- Full type coverage: 23 exported interfaces and union types
- Strict-mode compatible
- Composable return type interfaces (`UseRpcReturn`, `UseUtxoReturn`, etc.)

**Error handling**
- `KaspaError` base class with `.cause` chaining
- `KaspaNotReadyError`, `KaspaRpcError`, `KaspaWalletError`, `KaspaCryptoError`
