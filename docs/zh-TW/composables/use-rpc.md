# useRpc

管理與 Kaspa 節點的 WebSocket RPC 連線。提供響應式連線狀態，以及用於查詢區塊鏈和訂閱事件的方法。

## 匯入

```ts
import { useRpc } from 'vue-kaspa'
```

## 簽名

```ts
function useRpc(options?: RpcOptions): UseRpcReturn
```

傳入 `options` 以覆蓋此可組合函式實例的插件設定。省略則使用插件預設值。

## 連線狀態

連線狀態為**單例**——所有呼叫 `useRpc()` 的元件共享相同的響應式 ref。

### 連線狀態生命週期

```
disconnected ──► connecting ──► connected
     ▲                              │
     │            (node drops)      │
     └──── reconnecting ◄───────────┘
                  │
                  └──► error (after max retries)
```

自動重連使用指數退避策略，從 1 秒開始，最多 30 秒。

## 響應式屬性

| 屬性 | 型別 | 說明 |
|---|---|---|
| `connectionState` | `Readonly<Ref<RpcConnectionState>>` | 目前的連線狀態 |
| `isConnected` | `ComputedRef<boolean>` | 簡寫：`connectionState === 'connected'` |
| `url` | `Readonly<Ref<string \| null>>` | 已連線的節點 URL（連線後填入） |
| `networkId` | `Readonly<Ref<string \| null>>` | 節點回報的網路 ID |
| `serverVersion` | `Readonly<Ref<string \| null>>` | 節點軟體版本字串 |
| `isSynced` | `Readonly<Ref<boolean>>` | 節點是否已完全與網路同步 |
| `virtualDaaScore` | `Readonly<Ref<bigint>>` | 即時 DAA 分數——每個區塊更新 |
| `error` | `Readonly<Ref<Error \| null>>` | 最後一次連線錯誤 |
| `eventLog` | `Readonly<Ref<RpcEvent[]>>` | 最後 200 個 RPC 事件的環形緩衝區 |

## 連線管理

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

`connect()` 具有冪等性——在已連線時呼叫不會有任何效果。

如果你需要 txid 查詢、地址歷史、餘額或區塊探索器資料，請使用 [`useKaspaRest()`](/zh-TW/composables/use-kaspa-rest)。

## 查詢方法

所有查詢方法都需要活躍的連線。若節點無法連線或回傳錯誤，它們會拋出 `KaspaRpcError`。

### 節點資訊

```ts
// Full node metadata
const info = await rpc.getInfo()
// { networkId, serverVersion, isSynced, isUtxoIndexEnabled, hasNotifyCommand, hasMessageId }

// Chain block counts
const { blockCount, headerCount } = await rpc.getBlockCount()

// Connectivity check
await rpc.ping()
```

### 區塊

```ts
const block = await rpc.getBlock('abc123...')
// { hash, timestamp, blueScore, transactions: string[] }
```

### 餘額

```ts
// Single address
const { address, balance } = await rpc.getBalanceByAddress('kaspa:qr...')

// Multiple addresses (batch)
const results = await rpc.getBalancesByAddresses(['kaspa:qr...', 'kaspa:qs...'])
// results: Array<{ address: string; balance: bigint }>
```

::: tip 響應式餘額
如需即時餘額追蹤，建議使用 [`useUtxo()`](/composables/use-utxo) 而非 `getBalanceByAddress()`。它會訂閱 UTXO 變更事件並保持餘額響應式更新。
:::

### UTXO

```ts
const entries = await rpc.getUtxosByAddresses(['kaspa:qr...'])
// entries: UtxoEntry[]
```

### 記憶體池

```ts
// All mempool entries
const entries = await rpc.getMempoolEntries()
const entriesWithOrphans = await rpc.getMempoolEntries(true)

// Mempool entries for specific addresses
const myEntries = await rpc.getMempoolEntriesByAddresses(['kaspa:qr...'])
```

### 手續費

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

### 代幣供應量

```ts
const { circulatingCoinSupply, maxCoinSupply } = await rpc.getCoinSupply()
```

### 交易提交

```ts
// Submit a raw signed transaction (prefer useTransaction().send() for a higher-level API)
const txId = await rpc.submitTransaction(rawTx)
```

### UTXO 訂閱（低階）

```ts
// Subscribe the node to send utxos-changed events for these addresses
await rpc.subscribeUtxosChanged(['kaspa:qr...'])

// Unsubscribe
await rpc.unsubscribeUtxosChanged(['kaspa:qr...'])
```

::: tip
[`useUtxo()`](/composables/use-utxo) 會自動管理訂閱。僅在需要直接控制時才使用這些低階方法。
:::

## 事件訂閱

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

在 Vue 元件的 `<script setup>` 中註冊的處理器會在 `onUnmounted` 時自動移除。無需手動清理。

## 所有事件類型

| 事件 | 觸發時機 |
|---|---|
| `connect` | WebSocket 連線建立 |
| `disconnect` | WebSocket 連線中斷 |
| `block-added` | DAG 中新增了一個新區塊 |
| `virtual-chain-changed` | 虛擬鏈（所選父鏈）被重組 |
| `utxos-changed` | 已訂閱地址的 UTXO 發生變更 |
| `finality-conflict` | 偵測到最終性違規（罕見） |
| `finality-conflict-resolved` | 最終性違規已解決 |
| `sink-blue-score-changed` | sink 藍分更新 |
| `virtual-daa-score-changed` | 虛擬 DAA 分數更新（每個區塊觸發） |
| `new-block-template` | 有新的區塊模板可用（用於挖礦） |
| `pruning-point-utxo-set-override` | 修剪點 UTXO 集被覆蓋 |

## 事件日誌

事件日誌累積所有收到的事件（環形緩衝區，最後 200 個）：

```ts
// Read the log
console.log(rpc.eventLog.value)
// [{ type: 'block-added', data: {...}, timestamp: 1711234567890 }, ...]

// Clear it
rpc.clearEventLog()
```

日誌在路由切換與元件重新掛載時仍會保留。

## 在元件中使用

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
