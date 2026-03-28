# Nuxt モジュール

VKAS には Nuxt 3 向けのファーストクラスモジュールが付属しています。クライアント専用プラグインを登録し、すべてのコンポーザブルを自動インポートし、`@vue-kaspa/kaspa-wasm` をサーバーバンドルから自動的に除外します。

## セットアップ

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
<!-- pages/wallet.vue — no imports needed -->
<script setup lang="ts">
const rpc = useRpc()
const utxo = useUtxo()
</script>
```

## SSR の動作

`@vue-kaspa/kaspa-wasm` はブラウザ専用の WASM パッケージです。Nuxt モジュールはこれを 2 つの方法で処理します:

1. **クライアント専用プラグイン** — `KaspaPlugin` は Nuxt のクライアントプラグインとして登録されます。サーバーサイドレンダリング中は実行されません。
2. **SSR 外部化** — `@vue-kaspa/kaspa-wasm` は `vite.ssr.external` に追加され、Vite がサーバー側でバンドルまたは評価しようとするのを防ぎます。

SSR コンテキストで呼び出されたコンポーザブルは、例外をスローせずに安全な初期状態 (例: `wasmStatus: 'idle'`、`connectionState: 'disconnected'`) を返します。

## Nuxt でのカスタムノード

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
