# Vue 插件

## 基本設定

```ts
// main.ts
import { createApp } from 'vue'
import { VueKaspa } from 'vue-kaspa'
import App from './App.vue'

const app = createApp(App)

app.use(VueKaspa, {
  network: 'mainnet',
  autoConnect: true,
})

app.mount('#app')
```

當 `autoConnect: true`（預設值）時，Vue Kaspa 會在插件安裝時自動初始化 WASM 模組並連線到 Kaspa 節點。你的元件中無需進行任何額外設定。

## 插件選項

所有選項均為選填。

| 選項 | 型別 | 預設值 | 說明 |
|---|---|---|---|
| `network` | `KaspaNetwork` | `'mainnet'` | 要連線的網路 |
| `url` | `string` | — | 自訂 RPC WebSocket URL（例如 `'ws://127.0.0.1:17110'`）。與 `resolver` 互斥。 |
| `resolver` | `boolean` | `true` | 未設定 `url` 時使用公共 Kaspa 節點解析器 |
| `encoding` | `RpcEncoding` | `'Borsh'` | 傳輸編碼——`'Borsh'` 或 `'SerdeJson'` |
| `autoConnect` | `boolean` | `true` | 插件安裝時自動初始化 WASM 並連線 RPC |
| `devtools` | `boolean` | 開發環境為 `true` | 安裝 Vue DevTools 整合 |
| `panicHook` | `'console' \| 'browser' \| false` | `'console'` | WASM 崩潰處理器。`'browser'` 顯示對話框；`false` 停用。 |

## 連線至自訂節點

提供 `url` 以略過公共解析器並連線至你自己的節點：

```ts
app.use(VueKaspa, {
  network: 'testnet-10',
  url: 'ws://127.0.0.1:17210',
})
```

當提供 `url` 時，`resolver` 會自動設為 `false`。

## 手動初始化

停用 `autoConnect` 以控制 WASM 載入與 RPC 連線的時機：

```ts
app.use(VueKaspa, {
  network: 'mainnet',
  autoConnect: false,
})
```

然後在元件中手動初始化——例如，在使用者互動之後：

```vue
<script setup lang="ts">
import { useKaspa, useRpc } from 'vue-kaspa'

const kaspa = useKaspa()
const rpc = useRpc()

async function connect() {
  await kaspa.init()   // load WASM
  await rpc.connect()  // open WebSocket connection
}
</script>
```

## Testnet / devnet

```ts
app.use(VueKaspa, {
  network: 'testnet-10',
  // resolver automatically picks a testnet-10 node
})
```

可用網路：`'mainnet'` | `'testnet-10'` | `'testnet-12'` | `'simnet'` | `'devnet'`

## 插件冪等性

多次呼叫 `app.use(VueKaspa)` 不會有任何效果——插件會檢查是否已安裝並靜默略過重複初始化。
