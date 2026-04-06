# useRpc

Kaspa ノードへの WebSocket RPC 接続を管理します。リアクティブな接続状態と、ブロックチェーンのクエリおよびイベント購読のためのメソッドを提供します。

## インポート

```ts
import { useRpc } from 'vue-kaspa'
```

## シグネチャ

```ts
function useRpc(options?: RpcOptions): UseRpcReturn
```

`options` を渡すと、このコンポーザブルインスタンスのプラグイン設定を上書きできます。省略するとプラグインのデフォルトが使用されます。

## 接続状態

接続状態は**シングルトン** — `useRpc()` を呼び出すすべてのコンポーネントが同じリアクティブな ref を共有します。

### 接続状態のライフサイクル

```
disconnected ──► connecting ──► connected
     ▲                              │
     │            (node drops)      │
     └──── reconnecting ◄───────────┘
                  │
                  └──► error (after max retries)
```

自動再接続は 1 秒から始まり、30 秒を上限とした指数バックオフを使用します。

## リアクティブプロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `connectionState` | `Readonly<Ref<RpcConnectionState>>` | 現在の接続状態 |
| `isConnected` | `ComputedRef<boolean>` | 短縮形: `connectionState === 'connected'` |
| `url` | `Readonly<Ref<string \| null>>` | 接続中のノード URL (接続後に設定) |
| `networkId` | `Readonly<Ref<string \| null>>` | ノードが報告するネットワーク ID |
| `serverVersion` | `Readonly<Ref<string \| null>>` | ノードソフトウェアのバージョン文字列 |
| `isSynced` | `Readonly<Ref<boolean>>` | ノードがネットワークと完全に同期されているか |
| `virtualDaaScore` | `Readonly<Ref<bigint>>` | ライブ DAA スコア — ブロックごとに更新 |
| `error` | `Readonly<Ref<Error \| null>>` | 最後の接続エラー |
| `eventLog` | `Readonly<Ref<RpcEvent[]>>` | 直近 200 件の RPC イベントのリングバッファ |

## 接続管理

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

`connect()` はべき等です — 既に接続されている状態で呼び出しても何も起こりません。

txid 検索、アドレス履歴、残高、ブロック探索データが必要な場合は [`useKaspaRest()`](/ja/composables/use-kaspa-rest) を使ってください。

## クエリメソッド

すべてのクエリメソッドはアクティブな接続が必要です。ノードに到達できないかエラーが返った場合は `KaspaRpcError` をスローします。

### ノード情報

```ts
// Full node metadata
const info = await rpc.getInfo()
// { networkId, serverVersion, isSynced, isUtxoIndexEnabled, hasNotifyCommand, hasMessageId }

// Chain block counts
const { blockCount, headerCount } = await rpc.getBlockCount()

// Connectivity check
await rpc.ping()
```

### ブロック

```ts
const block = await rpc.getBlock('abc123...')
// { hash, timestamp, blueScore, transactions: string[] }
```

### 残高

```ts
// Single address
const { address, balance } = await rpc.getBalanceByAddress('kaspa:qr...')

// Multiple addresses (batch)
const results = await rpc.getBalancesByAddresses(['kaspa:qr...', 'kaspa:qs...'])
// results: Array<{ address: string; balance: bigint }>
```

::: tip リアクティブな残高
リアルタイムの残高追跡には `getBalanceByAddress()` より [`useUtxo()`](/ja/composables/use-utxo) を推奨します。UTXO 変更イベントを購読し、残高をリアクティブに保ちます。
:::

### UTXO

```ts
const entries = await rpc.getUtxosByAddresses(['kaspa:qr...'])
// entries: UtxoEntry[]
```

### メモリプール

```ts
// All mempool entries
const entries = await rpc.getMempoolEntries()
const entriesWithOrphans = await rpc.getMempoolEntries(true)

// Mempool entries for specific addresses
const myEntries = await rpc.getMempoolEntriesByAddresses(['kaspa:qr...'])
```

### 手数料

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

### コイン供給量

```ts
const { circulatingCoinSupply, maxCoinSupply } = await rpc.getCoinSupply()
```

### トランザクション送信

```ts
// Submit a raw signed transaction (prefer useTransaction().send() for a higher-level API)
const txId = await rpc.submitTransaction(rawTx)
```

### UTXO サブスクリプション (低レベル)

```ts
// Subscribe the node to send utxos-changed events for these addresses
await rpc.subscribeUtxosChanged(['kaspa:qr...'])

// Unsubscribe
await rpc.unsubscribeUtxosChanged(['kaspa:qr...'])
```

::: tip
[`useUtxo()`](/ja/composables/use-utxo) はサブスクリプションを自動的に管理します。直接制御が必要な場合のみこれらの低レベルメソッドを使用してください。
:::

## イベント購読

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

Vue コンポーネントの `<script setup>` 内で登録されたハンドラーは、`onUnmounted` 時に自動的に削除されます。手動クリーンアップは不要です。

## すべてのイベントタイプ

| イベント | 発火タイミング |
|---|---|
| `connect` | WebSocket 接続確立時 |
| `disconnect` | WebSocket 接続切断時 |
| `block-added` | 新しいブロックが DAG に追加された時 |
| `virtual-chain-changed` | バーチャルチェーン (選択された親チェーン) が再編成された時 |
| `utxos-changed` | 購読アドレスの UTXO が変化した時 |
| `finality-conflict` | ファイナリティ違反が検出された時 (まれ) |
| `finality-conflict-resolved` | ファイナリティ違反が解決された時 |
| `sink-blue-score-changed` | シンクのブルースコアが更新された時 |
| `virtual-daa-score-changed` | バーチャル DAA スコアが更新された時 (ブロックごとに発火) |
| `new-block-template` | 新しいブロックテンプレートが利用可能になった時 (マイニング用) |
| `pruning-point-utxo-set-override` | プルーニングポイントの UTXO セットが上書きされた時 |

## イベントログ

イベントログはすべての受信イベントを蓄積します (リングバッファ、直近 200 件):

```ts
// Read the log
console.log(rpc.eventLog.value)
// [{ type: 'block-added', data: {...}, timestamp: 1711234567890 }, ...]

// Clear it
rpc.clearEventLog()
```

ログはルート変更やコンポーネントの再マウントをまたいで保持されます。

## コンポーネントでの使用例

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
