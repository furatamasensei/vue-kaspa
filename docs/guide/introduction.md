# Introduction

Build Kaspa blockchain apps with Vue 3 — without touching WebAssembly directly.

Vue Kaspa handles the hard parts: loading WASM, managing a WebSocket connection to the network, keeping balances and UTXOs in sync, and wiring it all into Vue's reactivity system. You write components. It handles the blockchain.

## What you can build

- **Wallets** — connect KasWare or Kastle, show live balances, send KAS
- **Block explorers** — subscribe to new blocks and DAG events in real time
- **dApps** — read UTXOs, build and sign transactions, work with HD keys
- **Dashboards** — reactive network stats, fee estimates, UTXO history

## What it gives you

Eleven composables plus a unified facade cover the full workflow:

| Composable | What it does |
|---|---|
| [`useKaspa`](/composables/use-kaspa) | Start up the WASM runtime |
| [`useRpc`](/composables/use-rpc) | Connect to a Kaspa node, run queries, subscribe to events |
| [`useKaspaRest`](/composables/use-kaspa-rest) | Query the official REST API for txid lookup, balances, address history, and explorer data |
| [`useUtxo`](/composables/use-utxo) | Watch an address — reactive balance that updates in real time |
| [`useTransaction`](/composables/use-transaction) | Build, sign, and submit transactions |
| [`useTransactionListener`](/composables/use-transaction-listener) | Track accepted transaction IDs and sender addresses |
| [`useBlockListener`](/composables/use-block-listener) | Listen for new blocks as they are added |
| [`useCrypto`](/composables/use-crypto) | Generate keys, derive addresses, sign messages, convert units |
| [`useNetwork`](/composables/use-network) | Switch between mainnet, testnet-10, and other networks |
| [`useWallet`](/composables/use-wallet) | Connect to browser wallet extensions (KasWare, Kastle) |
| [`useVueKaspa`](/composables/use-vue-kaspa) | Unified typed facade for the full stack |

Plus a drop-in **`ConnectWallet`** component if you just need a connect button.

## Why not use the WASM SDK directly?

You can — but you'd be writing a lot of glue code. The WASM SDK gives you raw async calls. Vue Kaspa turns those into reactive refs that your templates can bind to, manages the connection lifecycle, handles cleanup when components unmount, and surfaces errors in a consistent way. It also sets up the Vue DevTools panel so you can inspect blockchain state alongside your component tree.

## Works with Vue and Nuxt

Install as a Vue plugin or use the Nuxt module — both get you auto-imports, the same composables, and the same behavior. Scaffold a starter project in seconds:

```sh
npx vue-kaspa-cli
```
