# Nuxt モジュール

VKAS には **Nuxt 3 および Nuxt 4** に対応したファーストクラスの Nuxt モジュールが付属しています。クライアント専用プラグインを登録し、すべてのコンポーザブルを自動インポートし、すべての WASM 設定を自動的に処理します — 手動での Vite 設定は不要です。

## セットアップ

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

これだけです。手動での Vite 設定も、明示的なプラグインのインストールも、`.vue` ファイルへの import 文も不要です。

## モジュールオプション

`kaspa` 設定キーは [`KaspaPluginOptions`](/ja/guide/vue-plugin#プラグインオプション) と同じオプションを受け付けます:

| オプション | 型 | デフォルト |
|---|---|---|
| `network` | `KaspaNetwork` | `'mainnet'` |
| `url` | `string` | — |
| `resolver` | `boolean` | `true` |
| `encoding` | `RpcEncoding` | `'Borsh'` |
| `autoConnect` | `boolean` | `true` |
| `devtools` | `boolean` | 開発時は `true` |
| `panicHook` | `'console' \| 'browser' \| false` | `'browser'` |

::: tip Nuxt のデフォルト
Nuxt モジュールでは `panicHook` のデフォルトが `'browser'` (WASM パニック時にダイアログを表示) に設定されています。`'console'` ではありません。
:::

## 自動インポート

以下のコンポーザブルはすべての `.vue` ファイル、`composables/`、`pages/` で自動的に利用可能です — import は不要です:

- `useKaspa`
- `useRpc`
- `useUtxo`
- `useTransaction`
- `useCrypto`
- `useNetwork`

```vue
<!-- pages/wallet.vue — import 不要 -->
<script setup lang="ts">
const rpc = useRpc()
const utxo = useUtxo()
</script>
```

## SSR の動作

`@vue-kaspa/kaspa-wasm` はブラウザ専用の WASM パッケージです。モジュールはこれに関するすべての設定を自動的に処理します:

1. **クライアント専用プラグイン** — `KaspaPlugin` は Nuxt のクライアントプラグインとして登録されます。サーバーサイドレンダリング中は実行されません。`autoConnect: true`（デフォルト）の場合、クライアントが読み込まれると WASM が初期化され、RPC 接続が自動的に確立されます — コンポーネントに `onMounted` を記述する必要はありません。
2. **SSR 外部化** — `@vue-kaspa/kaspa-wasm` は `vite.ssr.external` に追加され、Vite がサーバー側でバンドルまたは評価しようとするのを防ぎます。
3. **WASM プラグイン** — `vite-plugin-wasm` が Vite の設定に追加され、開発環境と本番ビルドの両方で WASM モジュールが正しくインスタンス化されます。
4. **COOP/COEP ヘッダー** — `Cross-Origin-Embedder-Policy: require-corp` と `Cross-Origin-Opener-Policy: same-origin` が Vite 開発サーバーと Nitro のルートルールに設定されます。これらは `kaspa-wasm` が内部で使用する `SharedArrayBuffer` に必要です。
5. **optimizeDeps** — `@vue-kaspa/kaspa-wasm` は Vite の依存関係プリバンドルから除外されます。

SSR コンテキストで呼び出されたコンポーザブルは、例外をスローせずに安全な初期状態 (例: `wasmStatus: 'idle'`、`connectionState: 'disconnected'`) を返します。

::: tip WASM コンポーネントを `<ClientOnly>` で囲む
WASM に依存するコンポーザブル (`useRpc`、`useKaspa`、`useUtxo` など) を使用するコンポーネントは、クライアントプラグインの初期化後にのみ有効な状態を持ちます。SSR でのレンダリングを防ぐために `<ClientOnly>` で囲んでください:

```vue
<template>
  <ClientOnly>
    <WalletCard />
  </ClientOnly>
</template>
```
:::

## Nuxt でのカスタムノード

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
