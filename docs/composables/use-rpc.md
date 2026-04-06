# useRpc

Manages the WebSocket RPC connection to a Kaspa node. Provides reactive connection state and methods for querying the blockchain and subscribing to events.

## Import

```ts
import { useRpc } from 'vue-kaspa'
```

## Signature

```ts
function useRpc(options?: RpcOptions): UseRpcReturn
```

Pass `options` to override the plugin configuration for this composable instance. Omit to use the plugin defaults.

## Connection state

The connection state is a **singleton** — all components calling `useRpc()` share the same reactive refs.

### Connection state lifecycle

```
disconnected ──► connecting ──► connected
     ▲                              │
     │            (node drops)      │
     └──── reconnecting ◄───────────┘
                  │
                  └──► error (after max retries)
```

Auto-reconnect uses exponential backoff starting at 1 second, capped at 30 seconds.

## Reactive properties

| Property | Type | Description |
|---|---|---|
| `connectionState` | `Readonly<Ref<RpcConnectionState>>` | Current connection state |
| `isConnected` | `ComputedRef<boolean>` | Shorthand: `connectionState === 'connected'` |
| `url` | `Readonly<Ref<string \| null>>` | Connected node URL (populated after connect) |
| `networkId` | `Readonly<Ref<string \| null>>` | Network ID reported by the node |
| `serverVersion` | `Readonly<Ref<string \| null>>` | Node software version string |
| `isSynced` | `Readonly<Ref<boolean>>` | Whether the node is fully synced with the network |
| `virtualDaaScore` | `Readonly<Ref<bigint>>` | Live DAA score — updates on every block |
| `error` | `Readonly<Ref<Error \| null>>` | Last connection error |
| `eventLog` | `Readonly<Ref<RpcEvent[]>>` | Ring buffer of last 200 RPC events |

## Connection management

```ts
const rpc = useRpc()

// Connect using plugin options
await rpc.connect()

// Connect to a specific node (overrides plugin options)
await rpc.connect({
  url: 'ws://127.0.0.1:17110',
  network: 'mainnet',
})

// Disconnect
await rpc.disconnect()

// Reconnect (disconnect + reconnect with same options)
await rpc.reconnect()
```

`connect()` is idempotent — calling it while already connected is a no-op.

## High-level listeners

For the common case of listening to new blocks or confirmed transactions, use the dedicated composables instead of managing subscriptions manually:

| Composable | Subscribes to | Exposes |
|---|---|---|
| [`useBlockListener()`](/composables/use-block-listener) | `block-added` | `blocks: Ref<BlockInfo[]>` |
| [`useTransactionListener()`](/composables/use-transaction-listener) | `virtual-chain-changed` | `transactions: Ref<string[]>, acceptedTransactions: Ref<...>` |

Both handle subscribe/unsubscribe lifecycle automatically and accumulate a reactive history.
If you need input-side sender addresses for confirmed payments, use the enriched `acceptedTransactions` history from `useTransactionListener()`.

## Query methods

All query methods require an active connection. They throw `KaspaRpcError` if the node is unreachable or returns an error.

### Node information

```ts
// Full node metadata
const info = await rpc.getInfo()
// { networkId, serverVersion, isSynced, isUtxoIndexEnabled, hasNotifyCommand, hasMessageId }

// Chain block counts
const { blockCount, headerCount } = await rpc.getBlockCount()

// DAG information
const dag = await rpc.getBlockDagInfo()
// { networkName, blockCount, headerCount, tipHashes, difficulty, virtualDaaScore, ... }

// Connectivity check
await rpc.ping()

// Sync status
const { isSynced } = await rpc.getSyncStatus()

// Current network name
const network = await rpc.getCurrentNetwork()

// Estimated network hash rate
const { networkHashesPerSecond } = await rpc.estimateNetworkHashesPerSecond(1000)
// Optional second arg: tipHash string

// Node metrics
const metrics = await rpc.getMetrics()
```

### Blocks

```ts
// Single block by hash
const block = await rpc.getBlock('abc123...')
// { hash, timestamp, blueScore, transactions: string[] }

// Range of blocks from a low hash
const blocks = await rpc.getBlocks({ lowHash: 'abc123...', includeTransactions: false })

// Block headers
const headers = await rpc.getHeaders('startHash', 100, true)

// DAG sink (virtual selected tip)
const { sink } = await rpc.getSink()
const { sinkBlueScore } = await rpc.getSinkBlueScore()

// Virtual chain from a given block
const chain = await rpc.getVirtualChainFromBlock('startHash', true)
// { removedChainBlockHashes, addedChainBlockHashes, acceptedTransactionIds? }

// Block template (for mining)
const template = await rpc.getBlockTemplate('kaspa:qr...', 'optional-extra-data')

// Subnetwork info
const subnet = await rpc.getSubnetwork('subnetworkId')
```

### Balances

```ts
// Single address
const { address, balance } = await rpc.getBalanceByAddress('kaspa:qr...')

// Multiple addresses (batch)
const results = await rpc.getBalancesByAddresses(['kaspa:qr...', 'kaspa:qs...'])
// results: Array<{ address: string; balance: bigint }>
```

::: tip Reactive balances
For real-time balance tracking, prefer [`useUtxo()`](/composables/use-utxo) over `getBalanceByAddress()`. It subscribes to UTXO change events and keeps the balance reactive.
:::

### UTXOs

```ts
const entries = await rpc.getUtxosByAddresses(['kaspa:qr...'])
// entries: UtxoEntry[]
```

### Mempool

```ts
// Single entry by transaction ID
const entry = await rpc.getMempoolEntry('txid...')

// All mempool entries
const entries = await rpc.getMempoolEntries()
const entriesWithOrphans = await rpc.getMempoolEntries(true)

// Mempool entries for specific addresses
const myEntries = await rpc.getMempoolEntriesByAddresses(['kaspa:qr...'])
```

### Fees

```ts
const estimate = await rpc.getFeeEstimate()
// {
//   priorityBucket: { feerate: number, estimatedSeconds: number },
//   normalBuckets:  Array<{ feerate, estimatedSeconds }>,
//   lowBuckets:     Array<{ feerate, estimatedSeconds }>
// }

// Use feerate with useTransaction():
await tx.send({ ..., feeRate: estimate.priorityBucket.feerate })
```

### Coin supply

```ts
const { circulatingCoinSupply, maxCoinSupply } = await rpc.getCoinSupply()
```

### Peers

```ts
const peers = await rpc.getConnectedPeerInfo()
// peers: ConnectedPeerInfo[]

const { banned, known } = await rpc.getPeerAddresses()
```

### Transaction submission

```ts
// Submit a raw signed transaction (prefer useTransaction().send() for a higher-level API)
const txId = await rpc.submitTransaction(rawTx)
```

### Mining / Admin

These methods require elevated node permissions.

```ts
// Submit a mined block
await rpc.submitBlock(block)
await rpc.submitBlock(block, true) // allowNonDaaBlocks

// Peer management
await rpc.addPeer('1.2.3.4:16111', false)
await rpc.ban('1.2.3.4')
await rpc.unban('1.2.3.4')

// Resolve a finality conflict
await rpc.resolveFinalityConflict('finalityBlockHash')

// Graceful node shutdown
await rpc.shutdown()
```

### UTXO subscriptions (low-level)

```ts
// Subscribe the node to send utxos-changed events for these addresses
await rpc.subscribeUtxosChanged(['kaspa:qr...'])

// Unsubscribe
await rpc.unsubscribeUtxosChanged(['kaspa:qr...'])
```

::: tip
[`useUtxo()`](/composables/use-utxo) manages subscriptions automatically. Use these low-level methods only if you need direct control.
:::

## Event subscriptions

```ts
const rpc = useRpc()

// Subscribe to events
rpc.on('block-added', (event) => {
  console.log('New block:', event.data, 'at', new Date(event.timestamp))
})

rpc.on('utxos-changed', (event) => {
  console.log('UTXOs changed for addresses:', event.data)
})

rpc.on('virtual-daa-score-changed', (event) => {
  console.log('DAA score:', event.data)
})

// Remove a specific handler
const handler = (event) => { ... }
rpc.on('block-added', handler)
rpc.off('block-added', handler)
```

Handlers registered inside a Vue component's `<script setup>` are automatically removed on `onUnmounted`. No manual cleanup needed.

## Subscription methods

Before events fire, you must tell the node which events to send. Each subscription has a matching unsubscribe method.

| Subscribe | Unsubscribe | Event emitted |
|---|---|---|
| `subscribeDaaScore()` | `unsubscribeDaaScore()` | `virtual-daa-score-changed` |
| `subscribeBlockAdded()` | `unsubscribeBlockAdded()` | `block-added` |
| `subscribeVirtualChainChanged(includeAcceptedTxIds)` | `unsubscribeVirtualChainChanged(includeAcceptedTxIds)` | `virtual-chain-changed` |
| `subscribeUtxosChanged(addresses)` | `unsubscribeUtxosChanged(addresses)` | `utxos-changed` |
| `subscribeVirtualDaaScoreChanged()` | `unsubscribeVirtualDaaScoreChanged()` | `virtual-daa-score-changed` |
| `subscribeSinkBlueScoreChanged()` | `unsubscribeSinkBlueScoreChanged()` | `sink-blue-score-changed` |
| `subscribeNewBlockTemplate()` | `unsubscribeNewBlockTemplate()` | `new-block-template` |
| `subscribeFinalityConflict()` | `unsubscribeFinalityConflict()` | `finality-conflict` |
| `subscribeFinalityConflictResolved()` | `unsubscribeFinalityConflictResolved()` | `finality-conflict-resolved` |
| `subscribePruningPointUtxoSetOverride()` | `unsubscribePruningPointUtxoSetOverride()` | `pruning-point-utxo-set-override` |

::: tip Higher-level alternatives
For `block-added` use [`useBlockListener()`](/composables/use-block-listener).
For `virtual-chain-changed` (accepted transactions) use [`useTransactionListener()`](/composables/use-transaction-listener).
Both handle subscribe/unsubscribe lifecycle automatically.
:::

```ts
// Example: subscribe to new blocks and listen
await rpc.subscribeBlockAdded()
rpc.on('block-added', (event) => {
  console.log('New block:', event.data)
})

// With accepted transaction IDs
await rpc.subscribeVirtualChainChanged(true)
rpc.on('virtual-chain-changed', (event) => {
  const accepted = event.data.acceptedTransactionIds ?? []
  console.log('Accepted txs:', accepted.flatMap(e => e.acceptedTransactionIds))
})

// Clean up
await rpc.unsubscribeBlockAdded()
await rpc.unsubscribeVirtualChainChanged(true)
```

## All event types

| Event | When it fires |
|---|---|
| `connect` | WebSocket connection established |
| `disconnect` | WebSocket connection lost |
| `block-added` | A new block has been added to the DAG |
| `virtual-chain-changed` | The virtual chain (selected parent chain) was reorganized |
| `utxos-changed` | UTXOs changed for a subscribed address |
| `finality-conflict` | A finality violation was detected (rare) |
| `finality-conflict-resolved` | A finality violation was resolved |
| `sink-blue-score-changed` | The sink blue score updated |
| `virtual-daa-score-changed` | The virtual DAA score updated (fires on every block) |
| `new-block-template` | A new block template is available (for mining) |
| `pruning-point-utxo-set-override` | The pruning point UTXO set was overridden |

## Event log

The event log accumulates all received events (ring buffer, last 200):

```ts
// Read the log
console.log(rpc.eventLog.value)
// [{ type: 'block-added', data: {...}, timestamp: 1711234567890 }, ...]

// Clear it
rpc.clearEventLog()
```

The log persists across route changes and component remounts.

## Usage in a component

```vue
<script setup lang="ts">
import { useRpc, useCrypto } from 'vue-kaspa'

const rpc = useRpc()
const crypto = useCrypto()

async function checkBalance() {
  const { balance } = await rpc.getBalanceByAddress('kaspa:qr...')
  console.log(crypto.sompiToKaspaString(balance), 'KAS')
}
</script>

<template>
  <div>
    <p>Status: {{ rpc.connectionState.value }}</p>
    <p v-if="rpc.isConnected.value">
      Node: {{ rpc.networkId.value }} v{{ rpc.serverVersion.value }}
    </p>
    <button @click="checkBalance" :disabled="!rpc.isConnected.value">
      Check balance
    </button>
  </div>
</template>
```
