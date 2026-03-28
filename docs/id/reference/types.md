# Tipe TypeScript

Semua tipe diekspor dari `vue-kaspa` dan tersedia untuk diimpor:

```ts
import type {
  KaspaPluginOptions,
  KaspaNetwork,
  // ...
} from 'vue-kaspa'
```

---

## KaspaPluginOptions

Opsi yang diberikan ke `app.use(KaspaPlugin, options)` atau kunci `kaspa` di `nuxt.config.ts`.

```ts
interface KaspaPluginOptions {
  network?: KaspaNetwork
  url?: string
  resolver?: boolean
  encoding?: RpcEncoding
  autoConnect?: boolean
  devtools?: boolean
  panicHook?: 'console' | 'browser' | false
}
```

| Field | Tipe | Default | Deskripsi |
|---|---|---|---|
| `network` | `KaspaNetwork` | `'mainnet'` | Jaringan yang akan dihubungkan |
| `url` | `string` | — | URL WebSocket RPC kustom |
| `resolver` | `boolean` | `true` | Gunakan resolver node publik |
| `encoding` | `RpcEncoding` | `'Borsh'` | Format encoding kawat |
| `autoConnect` | `boolean` | `true` | Auto-init WASM dan hubungkan saat dipasang |
| `devtools` | `boolean` | `true` di dev | Aktifkan integrasi Vue DevTools |
| `panicHook` | `'console' \| 'browser' \| false` | `'console'` | Handler panic WASM |

---

## KaspaNetwork

```ts
type KaspaNetwork = 'mainnet' | 'testnet-10' | 'testnet-11' | 'simnet' | 'devnet'
```

---

## RpcEncoding

```ts
type RpcEncoding = 'Borsh' | 'SerdeJson'
```

`'Borsh'` adalah encoding default dan direkomendasikan untuk performa. `'SerdeJson'` menghasilkan JSON yang mudah dibaca dan berguna untuk debugging.

---

## WasmStatus

```ts
type WasmStatus = 'idle' | 'loading' | 'ready' | 'error'
```

| Nilai | Arti |
|---|---|
| `'idle'` | WASM belum dimulai |
| `'loading'` | Modul WASM sedang diambil dan dikompilasi |
| `'ready'` | WASM diinisialisasi |
| `'error'` | Inisialisasi gagal |

---

## RpcConnectionState

```ts
type RpcConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
```

| Nilai | Arti |
|---|---|
| `'disconnected'` | Tidak ada koneksi |
| `'connecting'` | WebSocket sedang dibuka |
| `'connected'` | Koneksi aktif |
| `'reconnecting'` | Mencoba terhubung kembali setelah terputus |
| `'error'` | Koneksi gagal setelah maksimum percobaan ulang |

---

## RpcOptions

```ts
interface RpcOptions {
  url?: string
  resolver?: boolean
  network?: KaspaNetwork
  encoding?: RpcEncoding
}
```

Bagian dari `KaspaPluginOptions` — diberikan ke `useRpc().connect(options?)` untuk menimpa default plugin untuk satu koneksi.

---

## ServerInfo

Dikembalikan oleh `useRpc().getInfo()`.

```ts
interface ServerInfo {
  isUtxoIndexEnabled: boolean
  isSynced: boolean
  hasNotifyCommand: boolean
  hasMessageId: boolean
  serverVersion: string
  networkId: string
}
```

---

## BlockInfo

Dikembalikan oleh `useRpc().getBlock(hash)`.

```ts
interface BlockInfo {
  hash: string
  timestamp: number
  blueScore: bigint
  transactions: string[]  // ID transaksi
}
```

---

## UtxoEntry

Satu output UTXO. Kompatibel dengan `IUtxoEntry` dari `@vue-kaspa/kaspa-wasm` — aman untuk diberikan langsung ke `createTransactions()`.

```ts
interface UtxoEntry {
  address?: string
  outpoint: { transactionId: string; index: number }
  amount: bigint
  scriptPublicKey: { version: number; script: string }
  blockDaaScore: bigint
  isCoinbase: boolean
}
```

| Field | Deskripsi |
|---|---|
| `address` | Alamat pemilik (mungkin undefined untuk output skrip) |
| `outpoint` | ID transaksi + indeks output yang secara unik mengidentifikasi UTXO ini |
| `amount` | Nilai dalam sompi |
| `scriptPublicKey` | Skrip penguncian |
| `blockDaaScore` | Skor DAA dari blok yang menyertakan output ini |
| `isCoinbase` | `true` untuk hadiah mining (penundaan maturitas berlaku) |

---

## UtxoBalance

Saldo reaktif yang dihitung oleh `useUtxo()` dari entri UTXO yang dilacak.

```ts
interface UtxoBalance {
  mature: bigint    // Terkonfirmasi, dapat dibelanjakan (non-coinbase)
  pending: bigint   // Coinbase dengan penundaan maturitas, atau masuk yang belum dikonfirmasi
  outgoing: bigint  // Selalu 0n (dicadangkan)
}
```

---

## MempoolEntry

```ts
interface MempoolEntry {
  fee: bigint
  isOrphan: boolean
  transaction: {
    id: string
    inputs: unknown[]
    outputs: unknown[]
  }
}
```

---

## BalanceResult

Dikembalikan oleh `useRpc().getBalanceByAddress()` dan `getBalancesByAddresses()`.

```ts
interface BalanceResult {
  address: string
  balance: bigint  // dalam sompi
}
```

---

## FeeEstimate

Dikembalikan oleh `useRpc().getFeeEstimate()`. Menyediakan bucket tarif biaya pada berbagai tingkat prioritas.

```ts
interface FeeEstimate {
  priorityBucket: { feerate: number; estimatedSeconds: number }
  normalBuckets:  Array<{ feerate: number; estimatedSeconds: number }>
  lowBuckets:     Array<{ feerate: number; estimatedSeconds: number }>
}
```

`feerate` dalam sompi per gram massa transaksi. Gunakan dengan pengaturan `feeRate` di `useTransaction()`.

---

## RpcEventType

```ts
type RpcEventType =
  | 'connect'
  | 'disconnect'
  | 'block-added'
  | 'virtual-chain-changed'
  | 'utxos-changed'
  | 'finality-conflict'
  | 'finality-conflict-resolved'
  | 'sink-blue-score-changed'
  | 'virtual-daa-score-changed'
  | 'new-block-template'
  | 'pruning-point-utxo-set-override'
```

---

## RpcEvent&lt;T&gt;

Envelope event generik. Tipe dari `data` tergantung pada tipe event.

```ts
interface RpcEvent<T = unknown> {
  type: RpcEventType
  data: T
  timestamp: number  // Unix milidetik
}
```

---

## PaymentOutput

Satu penerima dalam sebuah transaksi.

```ts
interface PaymentOutput {
  address: string  // Alamat Kaspa
  amount: bigint   // dalam sompi
}
```

---

## TransactionSummary

Dikembalikan oleh `useTransaction().estimate()` dan `create()`.

```ts
interface TransactionSummary {
  fees: bigint                  // Total biaya dalam sompi
  mass: bigint                  // Total massa dalam gram
  transactions: number          // Jumlah transaksi (>1 = compounding)
  finalTransactionId?: string   // Diset setelah pengiriman melalui send()
  finalAmount?: bigint          // Jumlah output final setelah biaya
}
```

---

## CreateTransactionSettings

Input ke `useTransaction().estimate()`, `create()`, dan `send()`.

```ts
interface CreateTransactionSettings {
  entries: UtxoEntry[]
  outputs?: PaymentOutput[]
  changeAddress: string
  priorityFee?: bigint
  feeRate?: number
  payload?: string
  networkId?: string
}
```

| Field | Wajib | Deskripsi |
|---|---|---|
| `entries` | Ya | Input UTXO — berikan `useUtxo().entries.value` |
| `outputs` | Tidak | Penerima. Abaikan untuk konsolidasi UTXO sendiri. |
| `changeAddress` | Ya | Alamat pengembalian kembalian |
| `priorityFee` | Tidak | Biaya tetap dalam sompi |
| `feeRate` | Tidak | Biaya dinamis dalam sompi/gram (alternatif dari `priorityFee`) |
| `payload` | Tidak | Payload data yang di-encode hex |
| `networkId` | Tidak* | Diperlukan ketika `entries` adalah array biasa |

---

## PendingTx

Transaksi yang belum ditandatangani (atau sebagian ditandatangani) yang dikembalikan oleh `useTransaction().create()`.

```ts
interface PendingTx {
  sign(privateKeys: string[]): void
  submit(): Promise<string>
  serialize(): unknown
  addresses(): string[]
}
```

| Metode | Deskripsi |
|---|---|
| `sign(privateKeys)` | Tandatangani dengan satu atau beberapa kunci privat hex |
| `submit()` | Kirimkan ke jaringan, mengembalikan ID transaksi |
| `serialize()` | Dapatkan objek plain untuk inspeksi atau pengiriman eksternal |
| `addresses()` | Alamat input — berguna untuk memilih kunci penandatanganan yang diperlukan |

---

## KeypairInfo

```ts
interface KeypairInfo {
  privateKeyHex: string   // Kunci privat 32 byte dalam hex
  publicKeyHex: string    // Kunci publik terkompresi dalam hex
  address: string         // Alamat Kaspa spesifik jaringan
}
```

---

## MnemonicInfo

```ts
interface MnemonicInfo {
  phrase: string          // Kata-kata BIP-39 yang dipisahkan spasi
  wordCount: 12 | 24
}
```

---

## DerivedKey

Satu kunci dari derivasi HD wallet.

```ts
interface DerivedKey {
  index: number           // Posisi dalam rantai derivasi (berbasis 0)
  publicKeyHex: string
  address: string
}
```

---

## SignMessageResult

```ts
interface SignMessageResult {
  message: string
  signature: string       // Tanda tangan yang di-encode hex
  publicKeyHex: string
}
```

---

## Tipe kembalian composable

Setiap composable memiliki antarmuka tipe kembalian yang sesuai:

| Tipe | Composable |
|---|---|
| `UseKaspaReturn` | [`useKaspa()`](/composables/use-kaspa) |
| `UseRpcReturn` | [`useRpc()`](/composables/use-rpc) |
| `UseUtxoReturn` | [`useUtxo()`](/composables/use-utxo) |
| `UseTransactionReturn` | [`useTransaction()`](/composables/use-transaction) |
| `UseCryptoReturn` | [`useCrypto()`](/composables/use-crypto) |
| `UseNetworkReturn` | [`useNetwork()`](/composables/use-network) |
