# useRpc

Mengelola koneksi RPC WebSocket ke node Kaspa. Menyediakan state koneksi reaktif dan metode untuk melakukan query blockchain serta berlangganan event.

## Impor

```ts
import { useRpc } from 'vue-kaspa'
```

## Tanda tangan

```ts
function useRpc(options?: RpcOptions): UseRpcReturn
```

Berikan `options` untuk menimpa konfigurasi plugin pada instance composable ini. Abaikan untuk menggunakan default plugin.

## State koneksi

State koneksi adalah **singleton** — semua komponen yang memanggil `useRpc()` berbagi reactive ref yang sama.

### Siklus hidup state koneksi

```
disconnected ──► connecting ──► connected
     ▲                              │
     │            (node terputus)   │
     └──── reconnecting ◄───────────┘
                  │
                  └──► error (setelah maksimum percobaan ulang)
```

Auto-reconnect menggunakan exponential backoff mulai dari 1 detik, dibatasi hingga 30 detik.

## Properti reaktif

| Properti | Tipe | Deskripsi |
|---|---|---|
| `connectionState` | `Readonly<Ref<RpcConnectionState>>` | State koneksi saat ini |
| `isConnected` | `ComputedRef<boolean>` | Singkatan: `connectionState === 'connected'` |
| `url` | `Readonly<Ref<string \| null>>` | URL node yang terhubung (diisi setelah connect) |
| `networkId` | `Readonly<Ref<string \| null>>` | ID jaringan yang dilaporkan node |
| `serverVersion` | `Readonly<Ref<string \| null>>` | String versi perangkat lunak node |
| `isSynced` | `Readonly<Ref<boolean>>` | Apakah node telah tersinkronisasi sepenuhnya dengan jaringan |
| `virtualDaaScore` | `Readonly<Ref<bigint>>` | Skor DAA langsung — diperbarui setiap blok |
| `error` | `Readonly<Ref<Error \| null>>` | Error koneksi terakhir |
| `eventLog` | `Readonly<Ref<RpcEvent[]>>` | Ring buffer dari 200 event RPC terakhir |

## Manajemen koneksi

```ts
const rpc = useRpc()

// Hubungkan menggunakan opsi plugin
await rpc.connect()

// Hubungkan ke node tertentu (menimpa opsi plugin)
await rpc.connect({
  url: 'ws://127.0.0.1:17110',
  network: 'mainnet',
})

// Putuskan koneksi
await rpc.disconnect()

// Hubungkan kembali (putuskan + hubungkan kembali dengan opsi yang sama)
await rpc.reconnect()
```

`connect()` bersifat idempotent — memanggilnya saat sudah terhubung tidak akan berpengaruh.

Jika kamu membutuhkan pencarian txid, riwayat alamat, saldo, atau data block explorer, gunakan [`useKaspaRest()`](/id/composables/use-kaspa-rest).

## Metode query

Semua metode query memerlukan koneksi aktif. Metode ini melempar `KaspaRpcError` jika node tidak dapat dijangkau atau mengembalikan error.

### Informasi node

```ts
// Metadata node lengkap
const info = await rpc.getInfo()
// { networkId, serverVersion, isSynced, isUtxoIndexEnabled, hasNotifyCommand, hasMessageId }

// Jumlah blok rantai
const { blockCount, headerCount } = await rpc.getBlockCount()

// Pemeriksaan konektivitas
await rpc.ping()
```

### Blok

```ts
const block = await rpc.getBlock('abc123...')
// { hash, timestamp, blueScore, transactions: string[] }
```

### Saldo

```ts
// Satu alamat
const { address, balance } = await rpc.getBalanceByAddress('kaspa:qr...')

// Beberapa alamat (batch)
const results = await rpc.getBalancesByAddresses(['kaspa:qr...', 'kaspa:qs...'])
// results: Array<{ address: string; balance: bigint }>
```

::: tip Saldo reaktif
Untuk pelacakan saldo real-time, gunakan [`useUtxo()`](/composables/use-utxo) daripada `getBalanceByAddress()`. Metode ini berlangganan event perubahan UTXO dan menjaga saldo tetap reaktif.
:::

### UTXO

```ts
const entries = await rpc.getUtxosByAddresses(['kaspa:qr...'])
// entries: UtxoEntry[]
```

### Mempool

```ts
// Semua entri mempool
const entries = await rpc.getMempoolEntries()
const entriesWithOrphans = await rpc.getMempoolEntries(true)

// Entri mempool untuk alamat tertentu
const myEntries = await rpc.getMempoolEntriesByAddresses(['kaspa:qr...'])
```

### Biaya

```ts
const estimate = await rpc.getFeeEstimate()
// {
//   priorityBucket: { feerate: number, estimatedSeconds: number },
//   normalBuckets:  Array<{ feerate, estimatedSeconds }>,
//   lowBuckets:     Array<{ feerate, estimatedSeconds }>
// }

// Gunakan feerate dengan useTransaction():
await tx.send({ ..., feeRate: estimate.priorityBucket.feerate })
```

### Suplai koin

```ts
const { circulatingCoinSupply, maxCoinSupply } = await rpc.getCoinSupply()
```

### Pengiriman transaksi

```ts
// Kirim transaksi bertanda tangan mentah (gunakan useTransaction().send() untuk API level tinggi)
const txId = await rpc.submitTransaction(rawTx)
```

### Subscription UTXO (level rendah)

```ts
// Subscribe node untuk mengirim event utxos-changed untuk alamat ini
await rpc.subscribeUtxosChanged(['kaspa:qr...'])

// Unsubscribe
await rpc.unsubscribeUtxosChanged(['kaspa:qr...'])
```

::: tip
[`useUtxo()`](/composables/use-utxo) mengelola subscription secara otomatis. Gunakan metode level rendah ini hanya jika Anda memerlukan kontrol langsung.
:::

## Subscription event

```ts
const rpc = useRpc()

// Berlangganan event
rpc.on('block-added', (event) => {
  console.log('New block:', event.data, 'at', new Date(event.timestamp))
})

rpc.on('utxos-changed', (event) => {
  console.log('UTXOs changed for addresses:', event.data)
})

rpc.on('virtual-daa-score-changed', (event) => {
  console.log('DAA score:', event.data)
})

// Hapus handler tertentu
const handler = (event) => { ... }
rpc.on('block-added', handler)
rpc.off('block-added', handler)
```

Handler yang didaftarkan di dalam `<script setup>` komponen Vue secara otomatis dihapus saat `onUnmounted`. Tidak perlu cleanup manual.

## Semua tipe event

| Event | Kapan dipicu |
|---|---|
| `connect` | Koneksi WebSocket terbentuk |
| `disconnect` | Koneksi WebSocket terputus |
| `block-added` | Blok baru telah ditambahkan ke DAG |
| `virtual-chain-changed` | Virtual chain (selected parent chain) diatur ulang |
| `utxos-changed` | UTXO berubah untuk alamat yang berlangganan |
| `finality-conflict` | Pelanggaran finalitas terdeteksi (jarang) |
| `finality-conflict-resolved` | Pelanggaran finalitas diselesaikan |
| `sink-blue-score-changed` | Skor biru sink diperbarui |
| `virtual-daa-score-changed` | Skor DAA virtual diperbarui (dipicu setiap blok) |
| `new-block-template` | Template blok baru tersedia (untuk mining) |
| `pruning-point-utxo-set-override` | Set UTXO pruning point diganti |

## Log event

Log event mengakumulasi semua event yang diterima (ring buffer, 200 terakhir):

```ts
// Baca log
console.log(rpc.eventLog.value)
// [{ type: 'block-added', data: {...}, timestamp: 1711234567890 }, ...]

// Hapus log
rpc.clearEventLog()
```

Log tetap ada selama pergantian rute dan remount komponen.

## Penggunaan dalam komponen

```vue
<script setup lang="ts">
import { useRpc, useCrypto } from 'vue-kaspa'

const rpc = useRpc()
const crypto = useCrypto()

async function checkBalance() {
  const { balance } = await rpc.getBalanceByAddress('kaspa:qr...')
  console.log(crypto.sompiToKaspaString(balance), 'KAS')
}
</script>

<template>
  <div>
    <p>Status: {{ rpc.connectionState.value }}</p>
    <p v-if="rpc.isConnected.value">
      Node: {{ rpc.networkId.value }} v{{ rpc.serverVersion.value }}
    </p>
    <button @click="checkBalance" :disabled="!rpc.isConnected.value">
      Check balance
    </button>
  </div>
</template>
```
