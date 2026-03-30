# Vue DevTools

Vue Kaspa integrates with [Vue DevTools](https://devtools.vuejs.org) to give you live visibility into WASM status, RPC state, and blockchain events — without console.log.

DevTools integration is enabled automatically in development and disabled in production.

## Inspector panel

The inspector adds a **Kaspa** node to the Vue DevTools component inspector. It displays three sub-nodes:

### WASM

| Field | Description |
|---|---|
| `status` | Current `WasmStatus`: `idle` · `loading` · `ready` · `error` |

Color coding: green = `ready`, amber = `loading`, red = `error`, gray = `idle`.

### RPC

| Field | Description |
|---|---|
| `connectionState` | `disconnected` · `connecting` · `connected` · `reconnecting` · `error` |
| `url` | Connected node URL |
| `networkId` | Network reported by node (e.g. `'mainnet'`) |
| `serverVersion` | Node software version (e.g. `'0.14.1'`) |
| `isSynced` | Whether the node is fully synced |
| `virtualDaaScore` | Live DAA score (updates on every block) |

### Network

| Field | Description |
|---|---|
| `networkId` | Active network ID from the RPC connection |
| `daaScore` | Live DAA score |

## Event timeline

The DevTools **Timeline** includes a **Kaspa Events** layer (color: green). All 11 RPC event types are posted here as they arrive:

| Event | Log level |
|---|---|
| `block-added` | info |
| `virtual-daa-score-changed` | info |
| `utxos-changed` | info |
| `virtual-chain-changed` | info |
| `sink-blue-score-changed` | info |
| `new-block-template` | info |
| `connect` | info |
| `pruning-point-utxo-set-override` | info |
| `finality-conflict` | warning |
| `finality-conflict-resolved` | info |
| `disconnect` | error |

Each event shows a summary (block hash, DAA score, affected addresses, etc.) and the full JSON payload on click.

## Enabling and disabling

```ts
// Explicitly disable (useful in staging/production)
app.use(VueKaspa, {
  devtools: false,
})
```

The DevTools integration code is dynamically imported. When `devtools: false`, it is completely absent from the production bundle (tree-shaken).

## Requirements

- [Vue DevTools browser extension](https://devtools.vuejs.org/guide/installation) or the standalone Electron app
- Vue DevTools API v8 (bundled with `@vue/devtools-api ^8.1.1`, included as a dependency of Vue Kaspa)
