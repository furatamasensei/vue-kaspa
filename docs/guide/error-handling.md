# Error Handling

Vue Kaspa uses a structured error hierarchy so you can catch and handle errors by type.

## Error hierarchy

```
Error
└── KaspaError                  (base — all Vue Kaspa errors extend this)
    ├── KaspaNotReadyError       WASM not yet initialized
    ├── KaspaRpcError            RPC method call failed
    ├── KaspaWalletError         Wallet operation failed
    └── KaspaCryptoError         Cryptographic operation failed
```

All errors are exported from `vue-kaspa`:

```ts
import {
  KaspaError,
  KaspaNotReadyError,
  KaspaRpcError,
  KaspaWalletError,
  KaspaCryptoError,
} from 'vue-kaspa'
```

## KaspaError (base)

All Vue Kaspa errors extend `KaspaError`. It carries an optional `.cause` for the underlying error from `@vue-kaspa/kaspa-wasm`.

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

Thrown when a composable method is called before the WASM module has been initialized.

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

Typically you won't encounter this with `autoConnect: true` (the default).

## KaspaRpcError

Thrown when an RPC query or connection attempt fails.

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

Common causes:
- Node is not synced or offline
- Invalid parameters (e.g., malformed block hash)
- Network mismatch between plugin config and node

## KaspaCryptoError

Thrown by `useCrypto()` methods on invalid input.

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

Thrown by wallet-level operations (key import, wallet file operations). Reserved for future wallet management features.

## Error state on composables

In addition to thrown errors, some composables expose error state as reactive refs for use in templates:

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

## Recommended pattern

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
