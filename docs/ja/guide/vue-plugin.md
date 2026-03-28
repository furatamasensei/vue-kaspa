# Vue プラグイン

## 基本セットアップ

```ts
// main.ts
import { createApp } from 'vue'
import { KaspaPlugin } from 'vue-kaspa'
import App from './App.vue'

const app = createApp(App)

app.use(KaspaPlugin, {
  network: 'mainnet',
  autoConnect: true,
})

app.mount('#app')
```

`autoConnect: true` (デフォルト) を指定すると、VKAS はプラグインのインストール時に WASM モジュールを自動的に初期化し、Kaspa ノードに接続します。コンポーネント内での追加セットアップは不要です。

## プラグインオプション

すべてのオプションは省略可能です。

| オプション | 型 | デフォルト | 説明 |
|---|---|---|---|
| `network` | `KaspaNetwork` | `'mainnet'` | 接続するネットワーク |
| `url` | `string` | — | カスタム RPC WebSocket URL (例: `'ws://127.0.0.1:17110'`)。`resolver` とは排他的。 |
| `resolver` | `boolean` | `true` | `url` が設定されていない場合に公開 Kaspa ノードリゾルバーを使用する |
| `encoding` | `RpcEncoding` | `'Borsh'` | ワイヤーエンコーディング — `'Borsh'` または `'SerdeJson'` |
| `autoConnect` | `boolean` | `true` | プラグインインストール時に WASM の初期化と RPC 接続を自動実行する |
| `devtools` | `boolean` | 開発時は `true` | Vue DevTools 統合をインストールする |
| `panicHook` | `'console' \| 'browser' \| false` | `'console'` | WASM パニックハンドラー。`'browser'` はダイアログを表示、`false` は無効化。 |

## カスタムノードへの接続

`url` を指定すると、公開リゾルバーをバイパスして独自のノードに接続できます:

```ts
app.use(KaspaPlugin, {
  network: 'testnet-10',
  url: 'ws://127.0.0.1:17210',
})
```

`url` を指定した場合、`resolver` は自動的に `false` に設定されます。

## 手動初期化

`autoConnect` を無効にすることで、WASM のロードと RPC 接続のタイミングを制御できます:

```ts
app.use(KaspaPlugin, {
  network: 'mainnet',
  autoConnect: false,
})
```

その後、コンポーネント内で手動で初期化します — たとえばユーザー操作の後に:

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

## Testnet / Devnet

```ts
app.use(KaspaPlugin, {
  network: 'testnet-10',
  // resolver automatically picks a testnet-10 node
})
```

利用可能なネットワーク: `'mainnet'` | `'testnet-10'` | `'testnet-11'` | `'simnet'` | `'devnet'`

## プラグインのべき等性

`app.use(KaspaPlugin)` を複数回呼び出しても何も起こりません — プラグインは既存のインストールを確認し、再初期化を黙って無視します。
