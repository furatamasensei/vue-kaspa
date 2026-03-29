# Penanganan Error

Vue Kaspa menggunakan hierarki error terstruktur sehingga Anda dapat menangkap dan menangani error berdasarkan tipenya.

## Hierarki error

```
Error
└── KaspaError                  (dasar — semua error Vue Kaspa mewarisi ini)
    ├── KaspaNotReadyError       WASM belum diinisialisasi
    ├── KaspaRpcError            Pemanggilan metode RPC gagal
    ├── KaspaWalletError         Operasi dompet gagal
    └── KaspaCryptoError         Operasi kriptografi gagal
```

Semua error diekspor dari `vue-kaspa`:

```ts
import {
  KaspaError,
  KaspaNotReadyError,
  KaspaRpcError,
  KaspaWalletError,
  KaspaCryptoError,
} from 'vue-kaspa'
```

## KaspaError (dasar)

Semua error Vue Kaspa mewarisi `KaspaError`. Error ini membawa `.cause` opsional untuk error yang mendasari dari `@vue-kaspa/kaspa-wasm`.

```ts
try {
  await rpc.getInfo()
} catch (err) {
  if (err instanceof KaspaError) {
    console.error(err.message)     // pesan yang mudah dibaca manusia
    console.error(err.cause)       // error @vue-kaspa/kaspa-wasm yang mendasari (jika ada)
  }
}
```

## KaspaNotReadyError

Dilempar ketika metode composable dipanggil sebelum modul WASM diinisialisasi.

```ts
import { KaspaNotReadyError } from 'vue-kaspa'

try {
  await rpc.connect()
} catch (err) {
  if (err instanceof KaspaNotReadyError) {
    // Panggil kaspa.init() terlebih dahulu, atau aktifkan autoConnect: true pada plugin
    await kaspa.init()
    await rpc.connect()
  }
}
```

Biasanya Anda tidak akan menemui ini dengan `autoConnect: true` (default).

## KaspaRpcError

Dilempar ketika query RPC atau percobaan koneksi gagal.

```ts
import { KaspaRpcError } from 'vue-kaspa'

try {
  const info = await rpc.getInfo()
} catch (err) {
  if (err instanceof KaspaRpcError) {
    console.error('RPC call failed:', err.message)
    // err.cause berisi error RPC @vue-kaspa/kaspa-wasm mentah
  }
}
```

Penyebab umum:
- Node tidak tersinkronisasi atau offline
- Parameter tidak valid (mis. hash blok yang salah format)
- Ketidakcocokan jaringan antara konfigurasi plugin dan node

## KaspaCryptoError

Dilempar oleh metode `useCrypto()` pada input yang tidak valid.

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

Dilempar oleh operasi tingkat dompet (impor kunci, operasi file dompet). Dicadangkan untuk fitur manajemen dompet di masa depan.

## State error pada composable

Selain error yang dilempar, beberapa composable mengekspos state error sebagai reactive ref untuk digunakan di template:

```ts
const kaspa = useKaspa()
const rpc = useRpc()

// kaspa.wasmError.value — diset ketika inisialisasi WASM gagal
// rpc.error.value       — diset ketika koneksi gagal
```

```vue
<template>
  <div v-if="rpc.error.value" class="error">
    Connection error: {{ rpc.error.value.message }}
  </div>
</template>
```

## Pola yang direkomendasikan

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
      throw err  // lempar ulang error yang tidak terduga
    }
  }
}
```
