# インストール

## クイックセットアップ

最も手軽に始める方法は CLI を使うことです。WASM、CORS ヘッダー、動作する `KaspaStatus` コンポーネントをすべて含む完全なプロジェクトを自動生成します:

```bash
npx vue-kaspa-cli
```

プロジェクト名とフレームワーク（Vue 3 または Nuxt 4）を選択するだけです:

```
  vue-kaspa-cli — scaffold a Kaspa-connected Vue/Nuxt app

? Project name: kaspa-app
? Framework: Vue
```

その後:

```bash
cd kaspa-app
npm install
npm run dev
```

::: tip 手動セットアップ
**既存のプロジェクト**に vue-kaspa を追加する場合は、以下の手順に進んでください。
:::

## 前提条件

- Node.js 18 以上
- WASM をサポートするバンドラー — [Vite](https://vitejs.dev) を推奨

## パッケージのインストール

```bash
# npm
npm install vue-kaspa @vue-kaspa/kaspa-wasm

# pnpm
pnpm add vue-kaspa @vue-kaspa/kaspa-wasm

# yarn
yarn add vue-kaspa @vue-kaspa/kaspa-wasm
```

`vue-kaspa` と `@vue-kaspa/kaspa-wasm` の両方が必要です。`@vue-kaspa/kaspa-wasm` が基盤となる WASM バインディングを提供し、`vue-kaspa` がそれを Vue リアクティビティでラップします。

## Vite の WASM 設定

`@vue-kaspa/kaspa-wasm` は WebAssembly のインスタンス化を使用します。Vite の設定に `vite-plugin-wasm` を追加してください:

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
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },

  optimizeDeps: {
    exclude: ['@vue-kaspa/kaspa-wasm'],
  },
})
```

::: tip 開発環境での CORS ヘッダー
`Cross-Origin-Embedder-Policy` と `Cross-Origin-Opener-Policy` ヘッダーは、`@vue-kaspa/kaspa-wasm` が内部で使用する `SharedArrayBuffer` のサポートに必要です。これらがない場合、ブラウザで WASM の初期化が失敗します。
:::

::: tip 本番環境での CORS ヘッダー
`server.headers` の設定は Vite の開発サーバーにのみ適用されます。本番環境へのデプロイ時は、ホスティング層でこれらのヘッダーを設定する必要があります。

**Vercel** — プロジェクトルートに `vercel.json` を作成:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "credentialless" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]
    }
  ]
}
```

その他のホスト (Netlify、Cloudflare Pages など) には同等の `_headers` ファイルまたはダッシュボード設定があります。
:::

## TypeScript の設定

`tsconfig.json` のターゲットを ES2020 以降に設定してください (`BigInt` に必要です):

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

[Nuxt モジュール](/ja/guide/nuxt-module)は WASM/SSR の設定をすべて自動で処理します — 手動での Vite 設定は不要です。`vite-plugin-wasm`、COOP/COEP ヘッダー（開発・本番）、`optimizeDeps.exclude`、SSR 外部化がすべて含まれます。コンポーザブルは自動インポートされます。

カスタム SSR セットアップ (Nuxt 以外) の場合は、`@vue-kaspa/kaspa-wasm` をサーバーバンドルから除外してください:

```ts
// vite.config.ts (SSR)
export default defineConfig({
  ssr: {
    external: ['@vue-kaspa/kaspa-wasm'],
  },
})
```
