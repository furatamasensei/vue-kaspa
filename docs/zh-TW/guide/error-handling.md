# 錯誤處理

Vue Kaspa 使用結構化的錯誤層級體系，讓你可以依型別捕捉並處理錯誤。

## 錯誤層級

```
Error
└── KaspaError                  (基礎類別——所有 Vue Kaspa 錯誤均繼承自此)
    ├── KaspaNotReadyError       WASM 尚未初始化
    ├── KaspaRpcError            RPC 方法呼叫失敗
    ├── KaspaWalletError         錢包操作失敗
    └── KaspaCryptoError         加密操作失敗
```

所有錯誤均從 `vue-kaspa` 匯出：

```ts
import {
  KaspaError,
  KaspaNotReadyError,
  KaspaRpcError,
  KaspaWalletError,
  KaspaCryptoError,
} from 'vue-kaspa'
```

## KaspaError（基礎類別）

所有 Vue Kaspa 錯誤均繼承自 `KaspaError`。它攜帶一個選用的 `.cause`，用於存放來自 `@vue-kaspa/kaspa-wasm` 的底層錯誤。

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

當可組合函式方法在 WASM 模組初始化之前被呼叫時拋出。

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

使用 `autoConnect: true`（預設值）時通常不會遇到此錯誤。

## KaspaRpcError

當 RPC 查詢或連線嘗試失敗時拋出。

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

常見原因：
- 節點未同步或離線
- 無效參數（例如格式錯誤的區塊雜湊）
- 插件設定與節點之間的網路不匹配

## KaspaCryptoError

由 `useCrypto()` 方法在輸入無效時拋出。

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

由錢包層級操作（金鑰匯入、錢包檔案操作）拋出。保留給未來的錢包管理功能使用。

## 可組合函式上的錯誤狀態

除了拋出的錯誤之外，部分可組合函式也會將錯誤狀態以響應式 ref 的形式公開，以便在模板中使用：

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

## 建議模式

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
