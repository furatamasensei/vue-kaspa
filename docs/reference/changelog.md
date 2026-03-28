# Changelog

## v0.1.0

Initial release.

### Features

**Vue Plugin + Nuxt Module**
- `KaspaPlugin` for Vue 3 with full `KaspaPluginOptions` configuration
- Nuxt 3 module (`vkas/nuxt`) with auto-imports and SSR safety
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
