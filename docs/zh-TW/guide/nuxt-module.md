# Nuxt 模組

VKAS 提供一流的 Nuxt 3 模組。它會註冊一個僅限客戶端的插件、自動匯入所有可組合函式，並自動將 `@vue-kaspa/kaspa-wasm` 從伺服器套件中排除。

## 設定

```bash
npm install vue-kaspa @vue-kaspa/kaspa-wasm
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue-kaspa/nuxt'],

  kaspa: {
    network: 'mainnet',
    autoConnect: true,
    panicHook: 'browser',
  },
})
```

這樣就完成了。無需手動設定 Vite、無需明確安裝插件、無需在 `.vue` 檔案中撰寫 import 語句。

## 模組選項

`kaspa` 設定鍵接受與 [`KaspaPluginOptions`](/guide/vue-plugin#plugin-options) 相同的選項：

| 選項 | 型別 | 預設值 |
|---|---|---|
| `network` | `KaspaNetwork` | `'mainnet'` |
| `url` | `string` | — |
| `resolver` | `boolean` | `true` |
| `encoding` | `RpcEncoding` | `'Borsh'` |
| `autoConnect` | `boolean` | `true` |
| `devtools` | `boolean` | 開發環境為 `true` |
| `panicHook` | `'console' \| 'browser' \| false` | `'browser'` |

::: tip Nuxt 預設值
Nuxt 模組將 `panicHook` 預設為 `'browser'`（WASM 崩潰時顯示對話框），而非 `'console'`。
:::

## 自動匯入

以下可組合函式在所有 `.vue` 檔案、`composables/` 與 `pages/` 中均可自動使用，無需匯入：

- `useKaspa`
- `useRpc`
- `useUtxo`
- `useTransaction`
- `useCrypto`
- `useNetwork`

```vue
<!-- pages/wallet.vue — no imports needed -->
<script setup lang="ts">
const rpc = useRpc()
const utxo = useUtxo()
</script>
```

## SSR 行為

`@vue-kaspa/kaspa-wasm` 是一個僅限瀏覽器的 WASM 套件。Nuxt 模組以兩種方式處理此問題：

1. **僅限客戶端插件** — `KaspaPlugin` 被註冊為 Nuxt 客戶端插件。它在伺服器端渲染期間不會執行。
2. **SSR 外部** — `@vue-kaspa/kaspa-wasm` 被加入 `vite.ssr.external`，防止 Vite 在伺服器端嘗試打包或執行它。

在 SSR 環境中呼叫的可組合函式會回傳安全的空狀態（例如 `wasmStatus: 'idle'`、`connectionState: 'disconnected'`），而不會拋出錯誤。

## Nuxt 上的自訂節點

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue-kaspa/nuxt'],
  kaspa: {
    network: 'testnet-10',
    url: 'ws://your-node.example.com:17210',
  },
})
```
