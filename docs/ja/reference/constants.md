# 定数

## AVAILABLE_NETWORKS

```ts
import { AVAILABLE_NETWORKS } from 'vue-kaspa'
```

有効な `KaspaNetwork` 値をすべて含む読み取り専用の配列です:

```ts
const AVAILABLE_NETWORKS: readonly KaspaNetwork[] = [
  'mainnet',
  'testnet-10',
  'testnet-11',
  'simnet',
  'devnet',
]
```

**使用例:** ネットワーク選択ドロップダウンを構築する:

```vue
<script setup lang="ts">
import { AVAILABLE_NETWORKS, useNetwork } from 'vue-kaspa'

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

## WasmStatus の値

```ts
type WasmStatus = 'idle' | 'loading' | 'ready' | 'error'
```

| 値 | 説明 |
|---|---|
| `'idle'` | WASM 未開始 — 初期状態 |
| `'loading'` | WASM バイナリをフェッチ・コンパイル中 |
| `'ready'` | WASM 初期化完了、使用可能 |
| `'error'` | 初期化失敗 — `useKaspa().wasmError` を確認してください |

---

## RpcConnectionState の値

```ts
type RpcConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
```

| 値 | 説明 |
|---|---|
| `'disconnected'` | 未接続 — 初期状態 |
| `'connecting'` | WebSocket を開いている |
| `'connected'` | アクティブで正常な接続中 |
| `'reconnecting'` | 接続切断後に再接続を試みている |
| `'error'` | 接続が恒久的に失敗 (最大リトライ回数超過) |

---

## RpcEventType の値

`useRpc().on()` に渡すことができる 11 種類のイベントタイプすべてです:

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

| イベント | 頻度 | 説明 |
|---|---|---|
| `'connect'` | 接続時 | WebSocket 接続確立 |
| `'disconnect'` | 切断時 | WebSocket 接続切断 |
| `'block-added'` | 約 1 回/秒 | DAG に新しいブロックが追加された |
| `'virtual-daa-score-changed'` | 約 1 回/秒 | DAA スコアがインクリメントされた |
| `'utxos-changed'` | アクティビティ時 | 購読アドレスの UTXO が変化した |
| `'virtual-chain-changed'` | 約 1 回/秒 | 選択された親チェーンが更新された |
| `'sink-blue-score-changed'` | 時折 | シンクのブルースコアが更新された |
| `'new-block-template'` | 約 1 回/秒 | 新しいマイニングテンプレートが利用可能になった |
| `'finality-conflict'` | まれ | ファイナリティ違反が検出された |
| `'finality-conflict-resolved'` | まれ | ファイナリティ違反が解決された |
| `'pruning-point-utxo-set-override'` | まれ | プルーニングポイントが変更された |

---

## RpcEncoding の値

```ts
type RpcEncoding = 'Borsh' | 'SerdeJson'
```

| 値 | 説明 |
|---|---|
| `'Borsh'` | バイナリエンコーディング — 高速かつコンパクト (デフォルト) |
| `'SerdeJson'` | JSON エンコーディング — 人間が読める、デバッグに便利 |
