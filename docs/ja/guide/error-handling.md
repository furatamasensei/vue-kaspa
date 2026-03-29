# エラーハンドリング

Vue Kaspa は構造化されたエラー階層を使用しており、エラーの種類によって捕捉・処理できます。

## エラー階層

```
Error
└── KaspaError                  (ベース — すべての Vue Kaspa エラーはこれを継承)
    ├── KaspaNotReadyError       WASM がまだ初期化されていない
    ├── KaspaRpcError            RPC メソッド呼び出しが失敗した
    ├── KaspaWalletError         ウォレット操作が失敗した
    └── KaspaCryptoError         暗号操作が失敗した
```

すべてのエラーは `vue-kaspa` からエクスポートされています:

```ts
import {
  KaspaError,
  KaspaNotReadyError,
  KaspaRpcError,
  KaspaWalletError,
  KaspaCryptoError,
} from 'vue-kaspa'
```

## KaspaError (ベース)

すべての Vue Kaspa エラーは `KaspaError` を継承します。`@vue-kaspa/kaspa-wasm` からの基底エラーを保持するオプションの `.cause` を持ちます。

```ts
try {
  await rpc.getInfo()
} catch (err) {
  if (err instanceof KaspaError) {
    console.error(err.message)     // human-readable message
    console.error(err.cause)       // underlying @vue-kaspa/kaspa-wasm error (if any)
  }
}
```

## KaspaNotReadyError

WASM モジュールが初期化される前にコンポーザブルのメソッドが呼び出された場合にスローされます。

```ts
import { KaspaNotReadyError } from 'vue-kaspa'

try {
  await rpc.connect()
} catch (err) {
  if (err instanceof KaspaNotReadyError) {
    // Call kaspa.init() first, or enable autoConnect: true on the plugin
    await kaspa.init()
    await rpc.connect()
  }
}
```

`autoConnect: true` (デフォルト) を使用している場合、通常このエラーは発生しません。

## KaspaRpcError

RPC クエリまたは接続試行が失敗した場合にスローされます。

```ts
import { KaspaRpcError } from 'vue-kaspa'

try {
  const info = await rpc.getInfo()
} catch (err) {
  if (err instanceof KaspaRpcError) {
    console.error('RPC call failed:', err.message)
    // err.cause contains the raw @vue-kaspa/kaspa-wasm RPC error
  }
}
```

主な原因:
- ノードが同期されていないかオフライン
- 無効なパラメーター (例: 不正な形式のブロックハッシュ)
- プラグイン設定とノード間のネットワーク不一致

## KaspaCryptoError

無効な入力に対して `useCrypto()` のメソッドがスローします。

```ts
import { KaspaCryptoError } from 'vue-kaspa'

try {
  const keypair = crypto.mnemonicToKeypair('not a valid phrase', 'mainnet')
} catch (err) {
  if (err instanceof KaspaCryptoError) {
    console.error('Crypto operation failed:', err.message)
  }
}
```

## KaspaWalletError

ウォレットレベルの操作 (キーのインポート、ウォレットファイル操作) がスローします。将来のウォレット管理機能のために予約されています。

## コンポーザブルのエラー状態

スローされるエラーに加え、一部のコンポーザブルはテンプレートで使用するためのリアクティブな ref としてエラー状態を公開しています:

```ts
const kaspa = useKaspa()
const rpc = useRpc()

// kaspa.wasmError.value — set when WASM init fails
// rpc.error.value       — set when connection fails
```

```vue
<template>
  <div v-if="rpc.error.value" class="error">
    Connection error: {{ rpc.error.value.message }}
  </div>
</template>
```

## 推奨パターン

```ts
async function sendTransaction() {
  try {
    const txIds = await tx.send({ ... })
    console.log('Sent:', txIds)
  } catch (err) {
    if (err instanceof KaspaRpcError) {
      showToast('Network error: ' + err.message)
    } else if (err instanceof KaspaCryptoError) {
      showToast('Invalid key or address')
    } else {
      throw err  // re-throw unexpected errors
    }
  }
}
```
