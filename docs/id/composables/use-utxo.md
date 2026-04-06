# useUtxo

Melacak UTXO untuk satu atau beberapa alamat secara real-time. Berlangganan ke stream notifikasi perubahan UTXO node dan secara otomatis menghitung saldo reaktif.

## Impor

```ts
import { useUtxo } from 'vue-kaspa'
```

## Tipe kembalian

```ts
interface UseUtxoReturn {
  entries: Readonly<Ref<UtxoEntry[]>>
  balance: ComputedRef<UtxoBalance>
  trackedAddresses: Readonly<Ref<string[]>>
  isTracking: ComputedRef<boolean>
  track(addresses: string[]): Promise<void>
  untrack(addresses: string[]): Promise<void>
  refresh(): Promise<void>
  clear(): Promise<void>
}
```

## Properti

| Properti | Tipe | Deskripsi |
|---|---|---|
| `entries` | `Readonly<Ref<UtxoEntry[]>>` | Semua entri UTXO mentah untuk alamat yang dilacak |
| `balance` | `ComputedRef<UtxoBalance>` | Saldo reaktif yang diturunkan dari `entries` |
| `trackedAddresses` | `Readonly<Ref<string[]>>` | Alamat yang sedang dilacak |
| `isTracking` | `ComputedRef<boolean>` | `true` ketika minimal satu alamat dilacak |

## Metode

| Metode | Deskripsi |
|---|---|
| `track(addresses[])` | Berlangganan perubahan UTXO dan ambil UTXO saat ini untuk alamat yang diberikan |
| `untrack(addresses[])` | Berhenti berlangganan dan hapus UTXO untuk alamat yang diberikan |
| `refresh()` | Ambil ulang UTXO untuk semua alamat yang sedang dilacak |
| `clear()` | Berhenti berlangganan dari semua alamat dan hapus semua entri UTXO |

## Field saldo

```ts
interface UtxoBalance {
  mature: bigint    // Terkonfirmasi, dapat dibelanjakan (UTXO non-coinbase)
  pending: bigint   // UTXO coinbase dengan penundaan maturitas, atau masuk yang belum dikonfirmasi
  outgoing: bigint  // Selalu 0n (dicadangkan untuk pelacakan in-flight di masa depan)
}
```

- **`mature`** — aman untuk dibelanjakan. Berikan entri ini ke `useTransaction()`.
- **`pending`** — hadiah mining yang belum mencapai maturitas. Tidak dapat langsung dibelanjakan.
- **`outgoing`** — saat ini selalu `0n`.

## Penggunaan dasar

```vue
<script setup lang="ts">
import { useUtxo, useCrypto } from 'vue-kaspa'

const utxo = useUtxo()
const crypto = useCrypto()

await utxo.track(['kaspa:qr...'])
</script>

<template>
  <div v-if="utxo.isTracking.value">
    <p>
      Balance: {{ crypto.sompiToKaspaString(utxo.balance.value.mature) }} KAS
    </p>
    <p v-if="utxo.balance.value.pending > 0n">
      Pending: {{ crypto.sompiToKaspaString(utxo.balance.value.pending) }} KAS
    </p>
    <p>UTXOs: {{ utxo.entries.value.length }}</p>
  </div>
</template>
```

## Melacak beberapa alamat

Lacak semua alamat dari HD wallet dalam satu panggilan:

```ts
const crypto = useCrypto()
const utxo = useUtxo()

const { receive, change } = crypto.derivePublicKeys(phrase, 'mainnet', 20, 20)
const allAddresses = [
  ...receive.map(k => k.address),
  ...change.map(k => k.address),
]

await utxo.track(allAddresses)
// utxo.balance.value sekarang mencerminkan saldo gabungan di semua alamat
```

## Menggunakan entri dengan useTransaction

`utxo.entries.value` kompatibel dengan `CreateTransactionSettings.entries` — berikan langsung:

```ts
const utxo = useUtxo()
const tx = useTransaction()

await utxo.track(['kaspa:qr...'])

const txIds = await tx.send({
  entries: utxo.entries.value,  // berikan langsung
  outputs: [{ address: 'kaspa:qdest...', amount: 1_000_000_000n }],
  changeAddress: 'kaspa:qr...',
  priorityFee: 1000n,
  networkId: 'mainnet',
  privateKeys: ['your-private-key-hex'],
})
```

## Partial untracking

```ts
// Lacak tiga alamat
await utxo.track(['kaspa:qa...', 'kaspa:qb...', 'kaspa:qc...'])

// Kemudian, berhenti melacak salah satunya
await utxo.untrack(['kaspa:qb...'])
// utxo.entries.value tidak lagi berisi UTXO untuk kaspa:qb...
```

## Refresh manual

```ts
// Ambil ulang semua UTXO untuk alamat yang dilacak (berguna setelah transaksi dikonfirmasi)
await utxo.refresh()
```

## Auto-cleanup

Ketika `useUtxo()` dipanggil di dalam komponen Vue, `clear()` dipanggil secara otomatis saat `onUnmounted`. Ini berhenti berlangganan semua alamat dan melepaskan subscription sisi node.

```vue
<script setup lang="ts">
// Pelacakan UTXO komponen ini dibersihkan secara otomatis ketika komponen di-unmount
const utxo = useUtxo()
await utxo.track(['kaspa:qr...'])
</script>
```

::: warning Pinia stores
Jika Anda memanggil `useUtxo()` di luar komponen (mis. di Pinia store atau composable biasa), auto-cleanup tidak berlaku. Panggil `utxo.clear()` secara manual jika diperlukan.
:::

## Entri UTXO individual

```ts
utxo.entries.value.forEach(entry => {
  console.log({
    address:      entry.address,
    amount:       entry.amount,       // bigint dalam sompi
    isCoinbase:   entry.isCoinbase,   // true untuk hadiah mining
    txId:         entry.outpoint.transactionId,
    outputIndex:  entry.outpoint.index,
    daaScore:     entry.blockDaaScore,
  })
})
```
