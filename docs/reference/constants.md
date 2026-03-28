# Constants

## AVAILABLE_NETWORKS

```ts
import { AVAILABLE_NETWORKS } from 'vkas'
```

A readonly array of all valid `KaspaNetwork` values:

```ts
const AVAILABLE_NETWORKS: readonly KaspaNetwork[] = [
  'mainnet',
  'testnet-10',
  'testnet-11',
  'simnet',
  'devnet',
]
```

**Usage:** Build a network selector dropdown:

```vue
<script setup lang="ts">
import { AVAILABLE_NETWORKS, useNetwork } from 'vkas'

const network = useNetwork()
</script>

<template>
  <select
    :value="network.currentNetwork.value"
    @change="network.switchNetwork(($event.target as HTMLSelectElement).value as any)"
  >
    <option v-for="n in AVAILABLE_NETWORKS" :key="n" :value="n">
      {{ n }}
    </option>
  </select>
</template>
```

---

## WasmStatus values

```ts
type WasmStatus = 'idle' | 'loading' | 'ready' | 'error'
```

| Value | Description |
|---|---|
| `'idle'` | WASM not started — initial state |
| `'loading'` | Fetching and compiling the WASM binary |
| `'ready'` | WASM initialized and usable |
| `'error'` | Initialization failed — check `useKaspa().wasmError` |

---

## RpcConnectionState values

```ts
type RpcConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
```

| Value | Description |
|---|---|
| `'disconnected'` | Not connected — initial state |
| `'connecting'` | WebSocket opening |
| `'connected'` | Active, healthy connection |
| `'reconnecting'` | Attempting to reconnect after connection drop |
| `'error'` | Connection permanently failed (max retries exceeded) |

---

## RpcEventType values

All 11 event types that can be passed to `useRpc().on()`:

```ts
type RpcEventType =
  | 'connect'
  | 'disconnect'
  | 'block-added'
  | 'virtual-chain-changed'
  | 'utxos-changed'
  | 'finality-conflict'
  | 'finality-conflict-resolved'
  | 'sink-blue-score-changed'
  | 'virtual-daa-score-changed'
  | 'new-block-template'
  | 'pruning-point-utxo-set-override'
```

| Event | Frequency | Description |
|---|---|---|
| `'connect'` | On connect | WebSocket connection established |
| `'disconnect'` | On drop | WebSocket connection lost |
| `'block-added'` | ~1/sec | New block added to the DAG |
| `'virtual-daa-score-changed'` | ~1/sec | DAA score incremented |
| `'utxos-changed'` | On activity | UTXOs changed for a subscribed address |
| `'virtual-chain-changed'` | ~1/sec | Selected parent chain updated |
| `'sink-blue-score-changed'` | Occasionally | Sink blue score updated |
| `'new-block-template'` | ~1/sec | New mining template available |
| `'finality-conflict'` | Rare | Finality violation detected |
| `'finality-conflict-resolved'` | Rare | Finality violation resolved |
| `'pruning-point-utxo-set-override'` | Rare | Pruning point changed |

---

## RpcEncoding values

```ts
type RpcEncoding = 'Borsh' | 'SerdeJson'
```

| Value | Description |
|---|---|
| `'Borsh'` | Binary encoding — faster and more compact (default) |
| `'SerdeJson'` | JSON encoding — human-readable, useful for debugging |
