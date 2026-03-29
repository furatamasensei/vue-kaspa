# 常數

## AVAILABLE_NETWORKS

```ts
import { AVAILABLE_NETWORKS } from 'vue-kaspa'
```

所有有效 `KaspaNetwork` 值的唯讀陣列：

```ts
const AVAILABLE_NETWORKS: readonly KaspaNetwork[] = [
  'mainnet',
  'testnet-10',
  'testnet-12',
  'simnet',
  'devnet',
]
```

**使用範例：** 建立網路選擇下拉選單：

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

## WasmStatus 值

```ts
type WasmStatus = 'idle' | 'loading' | 'ready' | 'error'
```

| 值 | 說明 |
|---|---|
| `'idle'` | WASM 尚未啟動——初始狀態 |
| `'loading'` | 正在擷取與編譯 WASM 二進位檔 |
| `'ready'` | WASM 已初始化且可使用 |
| `'error'` | 初始化失敗——請檢查 `useKaspa().wasmError` |

---

## RpcConnectionState 值

```ts
type RpcConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
```

| 值 | 說明 |
|---|---|
| `'disconnected'` | 未連線——初始狀態 |
| `'connecting'` | WebSocket 正在開啟 |
| `'connected'` | 活躍且健康的連線 |
| `'reconnecting'` | 連線中斷後嘗試重連 |
| `'error'` | 連線永久失敗（已超過最大重試次數） |

---

## RpcEventType 值

所有 11 種可傳遞給 `useRpc().on()` 的事件類型：

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

| 事件 | 頻率 | 說明 |
|---|---|---|
| `'connect'` | 連線時 | WebSocket 連線建立 |
| `'disconnect'` | 中斷時 | WebSocket 連線中斷 |
| `'block-added'` | 約每秒 1 次 | DAG 中新增新區塊 |
| `'virtual-daa-score-changed'` | 約每秒 1 次 | DAA 分數增加 |
| `'utxos-changed'` | 有活動時 | 已訂閱地址的 UTXO 發生變更 |
| `'virtual-chain-changed'` | 約每秒 1 次 | 所選父鏈更新 |
| `'sink-blue-score-changed'` | 偶爾 | sink 藍分更新 |
| `'new-block-template'` | 約每秒 1 次 | 有新的挖礦模板可用 |
| `'finality-conflict'` | 罕見 | 偵測到最終性違規 |
| `'finality-conflict-resolved'` | 罕見 | 最終性違規已解決 |
| `'pruning-point-utxo-set-override'` | 罕見 | 修剪點已變更 |

---

## RpcEncoding 值

```ts
type RpcEncoding = 'Borsh' | 'SerdeJson'
```

| 值 | 說明 |
|---|---|
| `'Borsh'` | 二進位編碼——速度更快、更緊湊（預設值） |
| `'SerdeJson'` | JSON 編碼——人類可讀，適合除錯 |
