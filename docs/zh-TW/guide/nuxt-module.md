# Nuxt 模組

Vue Kaspa 提供與 **Nuxt 3 及 Nuxt 4** 相容的一流 Nuxt 模組。它會註冊一個僅限客戶端的插件、自動匯入所有可組合函式，並自動處理所有 WASM 設定——無需手動配置 Vite。

## 設定

```bash
npm install vue-kaspa @vue-kaspa/kaspa-wasm
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
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

`kaspa` 設定鍵接受與 [`KaspaPluginOptions`](/zh-TW/guide/vue-plugin#plugin-options) 相同的選項：

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
<!-- pages/wallet.vue — 無需 import -->
<script setup lang="ts">
const rpc = useRpc()
const utxo = useUtxo()
</script>
```

## SSR 行為

`@vue-kaspa/kaspa-wasm` 是一個僅限瀏覽器的 WASM 套件。模組會自動處理所有相關設定：

1. **僅限客戶端插件** — `KaspaPlugin` 被註冊為 Nuxt 客戶端插件，在伺服器端渲染期間不會執行。當 `autoConnect: true`（預設值）時，客戶端載入後會自動初始化 WASM 並建立 RPC 連線——元件中無需撰寫 `onMounted`。
2. **SSR 外部化** — `@vue-kaspa/kaspa-wasm` 被加入 `vite.ssr.external`，防止 Vite 在伺服器端打包或執行它。
3. **WASM 插件** — `vite-plugin-wasm` 會自動加入 Vite 設定，確保 WASM 模組在開發環境與正式建置中均能正確實例化。
4. **COOP/COEP 標頭** — `Cross-Origin-Embedder-Policy: require-corp` 與 `Cross-Origin-Opener-Policy: same-origin` 會設定在 Vite 開發伺服器及 Nitro 路由規則上。這些標頭是 `kaspa-wasm` 內部使用的 `SharedArrayBuffer` 所必需的。
5. **optimizeDeps** — `@vue-kaspa/kaspa-wasm` 從 Vite 的依賴預打包中排除。

在 SSR 環境中呼叫的可組合函式會回傳安全的空狀態（例如 `wasmStatus: 'idle'`、`connectionState: 'disconnected'`），而不會拋出錯誤。

::: tip 使用 `<ClientOnly>` 包裹 WASM 元件
使用依賴 WASM 的可組合函式（`useRpc`、`useKaspa`、`useUtxo` 等）的元件，只有在客戶端插件初始化後才具有有效狀態。請使用 `<ClientOnly>` 包裹以防止 SSR 渲染：

```vue
<template>
  <ClientOnly>
    <WalletCard />
  </ClientOnly>
</template>
```
:::

## Nuxt 上的自訂節點

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: ['vue-kaspa/nuxt'],
  kaspa: {
    network: 'testnet-10',
    url: 'ws://your-node.example.com:17210',
  },
})
```
