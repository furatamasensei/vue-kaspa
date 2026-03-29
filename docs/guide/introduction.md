# Introduction

**Vue Kaspa** is a Vue 3 plugin that provides reactive composables for interacting with the [Kaspa](https://kaspa.org) blockchain. It wraps [`@vue-kaspa/kaspa-wasm`](https://www.npmjs.com/package/@vue-kaspa/kaspa-wasm) — the official WebAssembly SDK — and exposes its functionality through idiomatic Vue 3 APIs.

## What you get

Six composables covering the full workflow:

| Composable | Purpose |
|---|---|
| [`useKaspa`](/composables/use-kaspa) | WASM initialization lifecycle |
| [`useRpc`](/composables/use-rpc) | WebSocket RPC connection, queries, and events |
| [`useUtxo`](/composables/use-utxo) | Real-time UTXO tracking and reactive balance |
| [`useTransaction`](/composables/use-transaction) | Transaction building, signing, and submission |
| [`useCrypto`](/composables/use-crypto) | Key generation, HD derivation, signing, unit conversion |
| [`useNetwork`](/composables/use-network) | Network switching (mainnet, testnet, etc.) |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Your Vue components / Nuxt pages                   │
│  useRpc()  useUtxo()  useTransaction()  useCrypto() │
└──────────────────────┬──────────────────────────────┘
                       │ Vue reactivity
┌──────────────────────▼──────────────────────────────┐
│  Internal singletons (shared across all components) │
│  RpcManager · WasmLoader · EventBridge              │
└──────────────────────┬──────────────────────────────┘
                       │ WASM calls
┌──────────────────────▼──────────────────────────────┐
│  @vue-kaspa/kaspa-wasm (WebAssembly)                           │
│  RpcClient · PrivateKey · XPrv · createTransactions │
└─────────────────────────────────────────────────────┘
```

The internal singletons are module-level — there is **one RPC connection** and **one WASM instance** per application, shared across all composable instances. This is intentional: a browser tab should not open multiple WebSocket connections to a Kaspa node.

## Public API surface

```ts
// Plugin
import { KaspaPlugin } from 'vue-kaspa'

// Composables
import { useKaspa, useRpc, useUtxo, useTransaction, useCrypto, useNetwork } from 'vue-kaspa'

// Error classes
import { KaspaError, KaspaNotReadyError, KaspaRpcError, KaspaWalletError, KaspaCryptoError } from 'vue-kaspa'

// Types (TypeScript)
import type { KaspaPluginOptions, KaspaNetwork, UtxoEntry, PendingTx, /* ... */ } from 'vue-kaspa'

// Constants
import { AVAILABLE_NETWORKS } from 'vue-kaspa'
```

## Peer dependencies

| Package | Version |
|---|---|
| `vue` | `>=3.4.0` |
| `@vue-kaspa/kaspa-wasm` | `>=1.1.0` |
| `@nuxt/kit` | `^3.0.0` *(optional — only needed for the Nuxt module)* |

## Design principles

- **Singleton state** — one RPC connection and WASM instance per app. Calling `useRpc()` from 10 components all returns the same reactive state.
- **Lazy WASM loading** — the WASM module is not loaded until `useKaspa().init()` is called (or automatically on plugin install when `autoConnect: true`).
- **Auto-cleanup** — composables used inside Vue components clean up subscriptions and event handlers on `onUnmounted`.
- **TypeScript-first** — all composable return types, options, and data structures are fully typed via exported interfaces.
- **Tree-shakeable** — DevTools integration is dynamically imported and absent from production bundles when `devtools: false`.
