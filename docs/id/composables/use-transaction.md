# useTransaction

Membangun, menandatangani, dan mengirimkan transaksi Kaspa. Membungkus `createTransactions()` dan `estimateTransactions()` dari `@vue-kaspa/kaspa-wasm` dan menangani UTXO compounding secara otomatis.

## Impor

```ts
import { useTransaction } from 'vue-kaspa'
```

## Tipe kembalian

```ts
interface UseTransactionReturn {
  estimate(settings: CreateTransactionSettings): Promise<TransactionSummary>
  create(settings: CreateTransactionSettings): Promise<{ transactions: PendingTx[]; summary: TransactionSummary }>
  send(settings: CreateTransactionSettings & { privateKeys: string[] }): Promise<string[]>
}
```

## Metode

| Metode | Deskripsi |
|---|---|
| `estimate(settings)` | Dry-run: hitung biaya dan massa tanpa membangun transaksi nyata |
| `create(settings)` | Bangun objek `PendingTx` yang belum ditandatangani dan siap untuk ditandatangani |
| `send(settings + privateKeys)` | Bangun, tandatangani, dan kirimkan semua transaksi dalam satu panggilan |

## CreateTransactionSettings

| Field | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `entries` | `UtxoEntry[]` | Ya | Input UTXO — berikan `useUtxo().entries.value` langsung |
| `outputs` | `PaymentOutput[]` | Tidak | Penerima pembayaran. Abaikan atau berikan `[]` untuk konsolidasi UTXO. |
| `changeAddress` | `string` | Ya | Alamat untuk menerima kembalian |
| `priorityFee` | `bigint` | Tidak | Total biaya prioritas dalam sompi. Diperlukan ketika `outputs` diberikan. |
| `feeRate` | `number` | Tidak | Tarif biaya dalam sompi per gram massa (alternatif dari `priorityFee`) |
| `payload` | `string` | Tidak | Payload data yang di-encode hex opsional |
| `networkId` | `string` | Tidak | String ID jaringan: `'mainnet'`, `'testnet-10'`, dll. Diperlukan ketika `entries` adalah array biasa. |

## Kirim cepat (one-shot)

Cara paling sederhana untuk mengirim KAS:

```ts
import { useUtxo, useTransaction, useCrypto } from 'vue-kaspa'

const utxo = useUtxo()
const tx = useTransaction()
const crypto = useCrypto()

// 1. Lacak alamat Anda untuk mendapatkan UTXO
await utxo.track(['kaspa:qrsrc...'])

// 2. Kirim
const txIds = await tx.send({
  entries: utxo.entries.value,
  outputs: [
    { address: 'kaspa:qrdest...', amount: crypto.kaspaToSompi('10') }, // 10 KAS
  ],
  changeAddress: 'kaspa:qrsrc...',
  priorityFee: 1000n,
  networkId: 'mainnet',
  privateKeys: ['your-64-char-hex-private-key'],
})

console.log('Transaction IDs:', txIds)
```

`send()` mengembalikan array ID transaksi — satu per transaksi yang dikirim. Biasanya hanya satu, tetapi bisa lebih banyak ketika UTXO compounding diperlukan.

## Estimasi biaya

Periksa biaya sebelum mengirim:

```ts
const summary = await tx.estimate({
  entries: utxo.entries.value,
  outputs: [{ address: 'kaspa:qrdest...', amount: 1_000_000_000n }],
  changeAddress: 'kaspa:qrsrc...',
  priorityFee: 1000n,
  networkId: 'mainnet',
})

console.log(`Fees: ${summary.fees} sompi`)
console.log(`Mass: ${summary.mass} grams`)
console.log(`Transactions: ${summary.transactions}`)
```

`estimate()` adalah dry run — tidak ada transaksi nyata yang dibangun atau dikirimkan.

## Tanda tangan + kirim manual (hardware wallet)

Gunakan `create()` ketika Anda memerlukan kontrol atas langkah penandatanganan — misalnya, saat menggunakan hardware wallet atau sistem manajemen kunci kustom:

```ts
const { transactions, summary } = await tx.create({
  entries: utxo.entries.value,
  outputs: [{ address: 'kaspa:qrdest...', amount: 1_000_000_000n }],
  changeAddress: 'kaspa:qrsrc...',
  priorityFee: 1000n,
  networkId: 'mainnet',
})

console.log(`Building ${summary.transactions} transaction(s), fees: ${summary.fees} sompi`)

for (const pending of transactions) {
  // Alamat mana yang perlu menandatangani transaksi ini?
  const signers = pending.addresses()

  // Tandatangani dengan key manager Anda
  pending.sign(['your-private-key-hex'])

  // Atau periksa transaksi yang belum ditandatangani terlebih dahulu
  const raw = pending.serialize()

  // Kirimkan ke jaringan
  const txId = await pending.submit()
  console.log('Submitted:', txId)
}
```

## UTXO compounding

Ketika sebuah alamat memiliki banyak UTXO kecil dan transaksi akan melebihi batas ukuran, `create()` (dan `send()`) secara otomatis menghasilkan beberapa transaksi:

1. **Transaksi compound** (N-1): mengkonsolidasikan UTXO menjadi lebih sedikit output yang lebih besar
2. **Transaksi final** (1): pembayaran aktual dengan input yang terkonsolidasi

Semua transaksi harus dikirimkan secara berurutan. `send()` menangani ini secara otomatis. Dengan `create()`, iterasi `transactions` dalam urutan array.

```ts
const { transactions, summary } = await tx.create({ ... })
// summary.transactions > 1 ketika compounding diperlukan
// summary.finalTransactionId — diset setelah semua dikirimkan melalui send()
```

## Konsolidasi UTXO (self-compound)

Konsolidasikan banyak UTXO kecil menjadi lebih sedikit output tanpa melakukan pembayaran:

```ts
const txIds = await tx.send({
  entries: utxo.entries.value,
  outputs: [],           // abaikan outputs atau berikan array kosong
  changeAddress: 'kaspa:qrself...',
  networkId: 'mainnet',
  privateKeys: ['private-key-hex'],
})
```

## Menggunakan fee rate daripada priority fee

Dapatkan estimasi biaya saat ini dan gunakan tarif langsung:

```ts
const rpc = useRpc()
const feeEstimate = await rpc.getFeeEstimate()

const txIds = await tx.send({
  entries: utxo.entries.value,
  outputs: [{ address: 'kaspa:qrdest...', amount: 1_000_000_000n }],
  changeAddress: 'kaspa:qrsrc...',
  feeRate: feeEstimate.priorityBucket.feerate,  // sompi per gram
  networkId: 'mainnet',
  privateKeys: ['private-key-hex'],
})
```

## TransactionSummary

```ts
interface TransactionSummary {
  fees: bigint              // Total biaya dalam sompi di semua transaksi
  mass: bigint              // Total massa dalam gram
  transactions: number      // Jumlah transaksi yang dihasilkan
  finalTransactionId?: string  // Diset setelah pengiriman melalui send()
  finalAmount?: bigint         // Jumlah output final setelah biaya
}
```

## Antarmuka PendingTx

```ts
interface PendingTx {
  sign(privateKeys: string[]): void    // Tandatangani dengan kunci privat hex
  submit(): Promise<string>            // Kirimkan ke jaringan, mengembalikan txId
  serialize(): unknown                 // Dapatkan objek plain untuk inspeksi
  addresses(): string[]                // Alamat input (untuk pemilihan kunci)
}
```
