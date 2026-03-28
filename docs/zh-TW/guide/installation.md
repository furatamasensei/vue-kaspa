# 安裝

## 快速設定

最快的起始方式是使用 CLI——它會自動建立包含 WASM、CORS 標頭與可運行的 `KaspaStatus` 元件的完整專案，一切皆已預先配置：

```bash
npx vue-kaspa-cli
```

依提示輸入專案名稱並選擇框架（Vue 3 或 Nuxt 4）：

```
  vue-kaspa-cli — scaffold a Kaspa-connected Vue/Nuxt app

? Project name: kaspa-app
? Framework: Vue
```

接著執行：

```bash
cd kaspa-app
npm install
npm run dev
```

::: tip 手動設定
要將 vue-kaspa 加入**現有專案**？請繼續閱讀以下步驟。
:::

## 前置條件

- Node.js 18+
- 支援 WASM 的打包工具——建議使用 [Vite](https://vitejs.dev)

## 安裝套件

```bash
# npm
npm install vue-kaspa @vue-kaspa/kaspa-wasm

# pnpm
pnpm add vue-kaspa @vue-kaspa/kaspa-wasm

# yarn
yarn add vue-kaspa @vue-kaspa/kaspa-wasm
```

`vue-kaspa` 與 `@vue-kaspa/kaspa-wasm` 皆為必要套件。`@vue-kaspa/kaspa-wasm` 提供底層 WASM 綁定；`vue-kaspa` 以 Vue 響應式對其進行封裝。

## Vite WASM 設定

`@vue-kaspa/kaspa-wasm` 使用 WebAssembly 實例化。請在你的 Vite 設定中加入 `vite-plugin-wasm`：

```bash
npm install -D vite-plugin-wasm
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  plugins: [vue(), wasm()],

  // Required for SharedArrayBuffer / WASM threading
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },

  optimizeDeps: {
    exclude: ['@vue-kaspa/kaspa-wasm'],
  },
})
```

::: tip 開發環境的 CORS 標頭
`Cross-Origin-Embedder-Policy` 與 `Cross-Origin-Opener-Policy` 標頭是 `@vue-kaspa/kaspa-wasm` 內部使用的 `SharedArrayBuffer` 支援所必需的。若缺少這些標頭，WASM 初始化將在瀏覽器中失敗。
:::

::: tip 正式環境的 CORS 標頭
`server.headers` 設定僅適用於 Vite 開發伺服器。正式部署時必須在託管層設定這些標頭。

**Vercel** — 在專案根目錄建立 `vercel.json`：
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]
    }
  ]
}
```

其他主機（Netlify、Cloudflare Pages 等）有等效的 `_headers` 檔案或儀表板設定。
:::

## TypeScript 設定

確保你的 `tsconfig.json` 目標為 ES2020 或更新版本（`BigInt` 所需）：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "bundler"
  }
}
```

## SSR / Nuxt

[Nuxt 模組](/zh-TW/guide/nuxt-module)會自動處理所有 WASM/SSR 設定——無需手動設定 Vite。這包括 `vite-plugin-wasm`、COOP/COEP 標頭（開發與正式環境）、`optimizeDeps.exclude` 及 SSR 外部化。可組合函式會自動匯入。

對於自訂 SSR 設定（非 Nuxt），請將 `@vue-kaspa/kaspa-wasm` 從伺服器套件中排除：

```ts
// vite.config.ts (SSR)
export default defineConfig({
  ssr: {
    external: ['@vue-kaspa/kaspa-wasm'],
  },
})
```
