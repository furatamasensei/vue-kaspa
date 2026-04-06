# Tipe TypeScript

Semua tipe diekspor dari `vue-kaspa` dan tersedia untuk diimpor:

```ts
import type {
  VueKaspaOptions,
  KaspaNetwork,
  // ...
} from 'vue-kaspa'
```

---

## VueKaspaOptions

Opsi yang diberikan ke `app.use(VueKaspa, options)` atau kunci `kaspa` di `nuxt.config.ts`.

```ts
interface VueKaspaOptions {
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
type KaspaNetwork = 'mainnet' | 'testnet-10' | 'testnet-12' | 'simnet' | 'devnet'
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

Bagian dari `VueKaspaOptions` — diberikan ke `useRpc().connect(options?)` untuk menimpa default plugin untuk satu koneksi.

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
| `UseVueKaspaReturn` | [`useVueKaspa()`](/composables/use-vue-kaspa) |

## KaspaRestOptions

Options passed to `useKaspaRest()`.

```ts
interface KaspaRestOptions {
  baseUrl?: string
  staleTime?: number
  cacheTime?: number
  headers?: HeadersInit
  fetcher?: typeof fetch
}
```

---

## KaspaRestRequestOptions

Per-request overrides for the REST composable.

```ts
interface KaspaRestRequestOptions {
  forceRefresh?: boolean
  staleTime?: number
  cache?: boolean
}
```

---

## KaspaRestResolvePreviousOutpoints

Controls how much previous-outpoint data REST should resolve.

```ts
type KaspaRestResolvePreviousOutpoints = 'no' | 'light' | 'full'
```

---

## KaspaRestError

Error thrown by the REST composable when a request fails.

```ts
class KaspaRestError extends KaspaError {}
```

---

## KaspaRestTransaction

Transaction payload returned by the REST composable.

```ts
interface KaspaRestTransaction {
  subnetwork_id?: string
  transaction_id?: string
  transactionId?: string
  hash?: string
  mass?: string
  payload?: string
  block_hash?: string[]
  block_time?: number
  version?: number
  is_accepted?: boolean
  accepting_block_hash?: string
  acceptingBlockHash?: string
  accepting_block_blue_score?: number
  acceptingBlockBlueScore?: number
  accepting_block_time?: number
  acceptingBlockTime?: number
  inputs?: unknown[]
  outputs?: unknown[]
  senderAddresses?: string[]
}
```

---

## KaspaRestSubmitTxScriptPublicKey

Used inside `KaspaRestSubmitTxOutput`.

```ts
interface KaspaRestSubmitTxScriptPublicKey {
  version: number
  scriptPublicKey: string
}
```

---

## KaspaRestSubmitTxOutpoint

Used inside `KaspaRestSubmitTxInput`.

```ts
interface KaspaRestSubmitTxOutpoint {
  transactionId: string
  index: number
}
```

---

## KaspaRestSubmitTxInput

Used inside `KaspaRestSubmitTxModel`.

```ts
interface KaspaRestSubmitTxInput {
  previousOutpoint: KaspaRestSubmitTxOutpoint
  signatureScript: string
  sequence: number
  sigOpCount: number
}
```

---

## KaspaRestSubmitTxOutput

Used inside `KaspaRestSubmitTxModel`.

```ts
interface KaspaRestSubmitTxOutput {
  amount: number
  scriptPublicKey: KaspaRestSubmitTxScriptPublicKey
}
```

---

## KaspaRestTxSearch

Request body for `searchTransactions()`.

```ts
interface KaspaRestTxSearch {
  transactionIds?: string[]
  acceptingBlueScores?: {
    gte: number
    lt: number
  }
}
```

---

## KaspaRestTxSearchAcceptingBlueScores

Filter object used by `KaspaRestTxSearch`.

```ts
interface KaspaRestTxSearchAcceptingBlueScores {
  gte: number
  lt: number
}
```

---

## KaspaRestSubmitTxModel

Transaction payload accepted by `submitTransaction()` and `calculateTransactionMass()`.

```ts
interface KaspaRestSubmitTxModel {
  version: number
  inputs: KaspaRestSubmitTxInput[]
  outputs: KaspaRestSubmitTxOutput[]
  lockTime?: number
  subnetworkId?: string
}
```

---

## KaspaRestSubmitTransactionRequest

Body sent to the REST `POST /transactions` endpoint.

```ts
interface KaspaRestSubmitTransactionRequest {
  transaction: KaspaRestSubmitTxModel
  allowOrphan?: boolean
}
```

---

## KaspaRestSubmitTransactionResponse

Returned by `submitTransaction()`.

```ts
interface KaspaRestSubmitTransactionResponse {
  transactionId?: string
  error?: string
}
```

---

## KaspaRestTxMass

Returned by `calculateTransactionMass()`.

```ts
interface KaspaRestTxMass {
  mass: number
  storage_mass: number
  compute_mass: number
}
```

---

## KaspaRestTransactionAcceptance

Returned by `getTransactionAcceptance()`.

```ts
interface KaspaRestTransactionAcceptance {
  transactionId: string
  accepted?: boolean
  acceptingBlockHash?: string
  acceptingBlueScore?: number
  acceptingTimestamp?: number
}
```

---

## KaspaRestAddressesActiveResponse

Returned by the experimental `POST /addresses/active` endpoint.

```ts
interface KaspaRestAddressesActiveResponse {
  address: string
  active: boolean
  lastTxBlockTime?: number
}
```

---

## KaspaRestAddressesActiveCountResponse

Returned by the experimental active-address count endpoints.

```ts
interface KaspaRestAddressesActiveCountResponse {
  timestamp: number
  dateTime: string
  count: number
}
```

---

## KaspaRestDistributionTier

Used by `KaspaRestDistributionTiers`.

```ts
interface KaspaRestDistributionTier {
  tier: number
  count: number
  amount: number
}
```

---

## KaspaRestDistributionTiers

Returned by the experimental address distribution endpoint.

```ts
interface KaspaRestDistributionTiers {
  timestamp: number
  tiers: KaspaRestDistributionTier[]
}
```

---

## KaspaRestOutpoint

Used by `KaspaRestUtxoResponse`.

```ts
interface KaspaRestOutpoint {
  transactionId?: string
  index?: number
}
```

---

## KaspaRestScriptPublicKey

Used by `KaspaRestUtxoModel`.

```ts
interface KaspaRestScriptPublicKey {
  version?: number
  script?: string
}
```

---

## KaspaRestUtxoModel

Used by `KaspaRestUtxoResponse`.

```ts
interface KaspaRestUtxoModel {
  amount?: string
  scriptPublicKey: KaspaRestScriptPublicKey
  blockDaaScore?: string
  isCoinbase?: boolean
}
```

---

## KaspaRestUtxoCountResponse

Returned by `useKaspaRest().getUtxoCountByAddress()`.

```ts
interface KaspaRestUtxoCountResponse {
  count: number
}
```

---

## KaspaRestBalancesByAddressEntry

Returned by `useKaspaRest().getBalancesByAddresses()`.

```ts
interface KaspaRestBalancesByAddressEntry {
  address: string
  balance: number
}
```

---

## KaspaRestBlockHeader

Used by `KaspaRestBlock` and `KaspaRestMaxHashrateResponse`.

```ts
interface KaspaRestBlockHeader {
  version?: number
  hashMerkleRoot?: string
  acceptedIdMerkleRoot?: string
  utxoCommitment?: string
  timestamp?: string
  bits?: number
  nonce?: string
  daaScore?: string
  blueWork?: string
  parents?: KaspaRestParentHash[]
  blueScore?: string
  pruningPoint?: string
}
```

---

## KaspaRestParentHash

Used by `KaspaRestBlockHeader`.

```ts
interface KaspaRestParentHash {
  parentHashes?: string[]
}
```

---

## KaspaRestVerboseData

Used by `KaspaRestBlock`.

```ts
interface KaspaRestVerboseData {
  hash?: string
  difficulty?: number
  selectedParentHash?: string
  transactionIds?: string[]
  blueScore?: string
  childrenHashes?: string[]
  mergeSetBluesHashes?: string[]
  mergeSetRedsHashes?: string[]
  isChainBlock?: boolean
}
```

---

## KaspaRestBlockTxInputPreviousOutpoint

Used by `KaspaRestBlockTxInput`.

```ts
interface KaspaRestBlockTxInputPreviousOutpoint {
  transactionId?: string
  index?: number
}
```

---

## KaspaRestBlockTxInput

Used by `KaspaRestBlockTx`.

```ts
interface KaspaRestBlockTxInput {
  previousOutpoint?: KaspaRestBlockTxInputPreviousOutpoint
  signatureScript?: string
  sigOpCount?: number
  sequence?: number
}
```

---

## KaspaRestBlockTxOutputScriptPublicKey

Used by `KaspaRestBlockTxOutput`.

```ts
interface KaspaRestBlockTxOutputScriptPublicKey {
  scriptPublicKey?: string
  version?: number
}
```

---

## KaspaRestBlockTxOutputVerboseData

Used by `KaspaRestBlockTxOutput`.

```ts
interface KaspaRestBlockTxOutputVerboseData {
  scriptPublicKeyType?: string
  scriptPublicKeyAddress?: string
}
```

---

## KaspaRestBlockTxOutput

Used by `KaspaRestBlockTx`.

```ts
interface KaspaRestBlockTxOutput {
  amount?: number
  scriptPublicKey?: KaspaRestBlockTxOutputScriptPublicKey
  verboseData?: KaspaRestBlockTxOutputVerboseData
}
```

---

## KaspaRestBlockTxVerboseData

Used by `KaspaRestBlockTx`.

```ts
interface KaspaRestBlockTxVerboseData {
  transactionId: string
  hash?: string
  computeMass?: number
  blockHash?: string
  blockTime?: number
}
```

---

## KaspaRestBlockTx

Used by `KaspaRestBlock`.

```ts
interface KaspaRestBlockTx {
  inputs?: KaspaRestBlockTxInput[]
  outputs?: KaspaRestBlockTxOutput[]
  subnetworkId?: string
  payload?: string
  verboseData: KaspaRestBlockTxVerboseData
  lockTime?: number
  gas?: number
  mass?: number
  version?: number
}
```

---

## KaspaRestBlock

Returned by `useKaspaRest().getBlock()`.

```ts
interface KaspaRestBlock {
  header: KaspaRestBlockHeader
  transactions?: KaspaRestBlockTx[]
  verboseData: KaspaRestVerboseData
  extra?: Record<string, unknown>
}
```

---

## KaspaRestBlockResponse

Returned by `useKaspaRest().getBlocks()`.

```ts
interface KaspaRestBlockResponse {
  blockHashes?: string[]
  blocks?: KaspaRestBlock[]
}
```

---

## KaspaRestBlueScoreResponse

Returned by `useKaspaRest().getVirtualSelectedParentBlueScore()`.

```ts
interface KaspaRestBlueScoreResponse {
  blueScore: number
}
```

---

## KaspaRestBlockdagResponse

Returned by `useKaspaRest().getBlockDag()` and `getNetwork()`.

```ts
interface KaspaRestBlockdagResponse {
  networkName: string
  blockCount: string
  headerCount: string
  tipHashes: string[]
  difficulty: number
  pastMedianTime: string
  virtualParentHashes: string[]
  pruningPointHash: string
  virtualDaaScore: string
  sink: string
}
```

---

## KaspaRestCoinSupplyResponse

Returned by `useKaspaRest().getCoinSupply()`.

```ts
interface KaspaRestCoinSupplyResponse {
  circulatingSupply: string
  maxSupply: string
}
```

---

## KaspaRestBlockRewardResponse

Returned by `useKaspaRest().getBlockReward()`.

```ts
interface KaspaRestBlockRewardResponse {
  blockreward: number
}
```

---

## KaspaRestHalvingResponse

Returned by `useKaspaRest().getHalving()`.

```ts
interface KaspaRestHalvingResponse {
  nextHalvingTimestamp: number
  nextHalvingDate: string
  nextHalvingAmount: number
}
```

---

## KaspaRestHashrateResponse

Returned by `useKaspaRest().getHashrate()`.

```ts
interface KaspaRestHashrateResponse {
  hashrate: number
}
```

---

## KaspaRestMaxHashrateResponse

Returned by `useKaspaRest().getMaxHashrate()`.

```ts
interface KaspaRestMaxHashrateResponse {
  hashrate?: number
  blockheader: KaspaRestBlockHeader
}
```

---

## KaspaRestHashrateHistoryResponse

Returned by `useKaspaRest().getHashrateHistory()` and `getHashrateHistoryFor()`.

```ts
interface KaspaRestHashrateHistoryResponse {
  daaScore: number
  blueScore: number
  timestamp: number
  date_time: string
  bits?: number
  difficulty: number
  hashrate_kh: number
}
```

---

## KaspaRestDBCheckStatus

Used by `KaspaRestHealthResponse`.

```ts
interface KaspaRestDBCheckStatus {
  isSynced?: boolean
  blueScore?: number
  blueScoreDiff?: number
  acceptedTxBlockTime?: number
  acceptedTxBlockTimeDiff?: number
}
```

---

## KaspaRestKaspadResponse

Used by `KaspaRestHealthResponse`.

```ts
interface KaspaRestKaspadResponse {
  kaspadHost: string
  serverVersion?: string
  isUtxoIndexed?: boolean
  isSynced?: boolean
  p2pId?: string
  blueScore?: number
}
```

---

## KaspaRestHealthResponse

Returned by `useKaspaRest().getHealth()`.

```ts
interface KaspaRestHealthResponse {
  kaspadServers: KaspaRestKaspadResponse[]
  database: KaspaRestDBCheckStatus
}
```

---

## KaspaRestKaspadInfoResponse

Returned by `useKaspaRest().getKaspadInfo()`.

```ts
interface KaspaRestKaspadInfoResponse {
  mempoolSize: string
  serverVersion: string
  isUtxoIndexed: boolean
  isSynced: boolean
  p2pIdHashed: string
}
```

---

## KaspaRestPriceResponse

Used by the raw REST `GET /info/price` endpoint via `request()`.

```ts
interface KaspaRestPriceResponse {
  price: number
}
```

---

## KaspaRestMarketCapResponse

Returned by `useKaspaRest().getMarketcap()` when the response is JSON.

```ts
interface KaspaRestMarketCapResponse {
  marketcap: number
}
```

---

## KaspaRestUtxoResponse

Returned by `useKaspaRest().getUtxosByAddress()` and `getUtxosByAddresses()`.

```ts
interface KaspaRestUtxoResponse {
  address?: string
  outpoint: {
    transactionId?: string
    index?: number
  }
  utxoEntry: {
    amount?: string
    scriptPublicKey: {
      version?: number
      script?: string
    }
    blockDaaScore?: string
    isCoinbase?: boolean
  }
}
```

---

## KaspaRestBalanceResponse

Returned by `useKaspaRest().getAddressBalance()`.

```ts
interface KaspaRestBalanceResponse {
  address: string
  balance: number
}
```

---

## KaspaRestAddressBalanceHistory

Returned by `useKaspaRest().getAddressBalanceHistory()`.

```ts
interface KaspaRestAddressBalanceHistory {
  timestamp: number
  amount: number
}
```

---

## KaspaRestAddressName

Returned by `useKaspaRest().getAddressName()` and `getAddressNames()`.

```ts
interface KaspaRestAddressName {
  address: string
  name: string
}
```

---

## KaspaRestTopAddresses

Returned by `useKaspaRest().getTopAddresses()`.

```ts
interface KaspaRestTopAddresses {
  timestamp: number
  ranking: {
    rank: number
    address: string
    amount: number
  }[]
}
```

---

## KaspaRestTopAddress

Used by `KaspaRestTopAddresses`.

```ts
interface KaspaRestTopAddress {
  rank: number
  address: string
  amount: number
}
```

---

## KaspaRestTransactionCount

Returned by `useKaspaRest().getAddressTransactionCount()`.

```ts
interface KaspaRestTransactionCount {
  total: number
}
```

---

## KaspaRestTransactionCountResponse

Returned by the experimental transaction count endpoints.

```ts
interface KaspaRestTransactionCountResponse {
  timestamp: number
  dateTime: string
  coinbase: number
  regular: number
}
```

---

## KaspaRestVcBlock

Returned by `useKaspaRest().getVirtualChain()`.

```ts
interface KaspaRestVcBlock {
  hash: string
  blue_score: number
  daa_score?: number
  timestamp?: number
  transactions?: {
    transaction_id: string
    is_accepted?: boolean
  }[]
}
```

---

## KaspaRestVcTxInput

Used by `KaspaRestVcTx`.

```ts
interface KaspaRestVcTxInput {
  previous_outpoint_hash: string
  previous_outpoint_index: number
  signature_script?: string
  previous_outpoint_script?: string
  previous_outpoint_address?: string
  previous_outpoint_amount?: number
}
```

---

## KaspaRestVcTxOutput

Used by `KaspaRestVcTx`.

```ts
interface KaspaRestVcTxOutput {
  script_public_key: string
  script_public_key_address: string
  amount: number
}
```

---

## KaspaRestVcTx

Used by `KaspaRestVcBlock`.

```ts
interface KaspaRestVcTx {
  transaction_id: string
  is_accepted?: boolean
  inputs?: KaspaRestVcTxInput[]
  outputs?: KaspaRestVcTxOutput[]
}
```

---

## KaspaRestBalanceEntry

Returned by `useKaspaRest().getBalancesByAddresses()`.

```ts
interface KaspaRestBalanceEntry {
  address: string
  balance: number
}
```

---

## UseKaspaRestReturn

Returned by `useKaspaRest()`.

```ts
interface UseKaspaRestReturn {
  baseUrl: Readonly<Ref<string>>
  cacheSize: ComputedRef<number>
  clearCache(prefix?: string): void
  request<T>(method: 'GET' | 'POST', path: string, options?: unknown): Promise<T>
  getTransaction(transactionId: string, options?: unknown): Promise<KaspaRestTransaction | null>
  getTransactionById(transactionId: string, options?: unknown): Promise<KaspaRestTransaction | null>
  searchTransactions(request: KaspaRestTxSearch, options?: unknown): Promise<KaspaRestTransaction[]>
  getAddressBalance(address: string, options?: unknown): Promise<KaspaRestBalanceEntry>
  getAddressBalanceHistory(address: string, dayOrMonth: string, options?: unknown): Promise<KaspaRestAddressBalanceHistory[]>
  getAddressNames(options?: unknown): Promise<KaspaRestAddressName[]>
  getAddressName(address: string, options?: unknown): Promise<KaspaRestAddressName>
  getTopAddresses(options?: unknown): Promise<KaspaRestTopAddresses[]>
  getFullTransactionsByAddress(address: string, options?: unknown): Promise<KaspaRestTransaction[]>
  getFullTransactionsByAddressPage(address: string, options?: unknown): Promise<KaspaRestTransaction[]>
  getUtxosByAddress(address: string, options?: unknown): Promise<KaspaRestUtxoResponse[]>
  getBalancesByAddresses(addresses: string[], options?: unknown): Promise<KaspaRestBalanceEntry[]>
  getTransactionAcceptance(transactionIds: string[], options?: unknown): Promise<KaspaRestTransactionAcceptance[]>
  getTransactionsCount(options?: unknown): Promise<KaspaRestTransactionCountResponse>
  getTransactionsCountFor(dayOrMonth: string, options?: unknown): Promise<KaspaRestTransactionCountResponse[]>
  getVirtualChain(options?: unknown): Promise<KaspaRestVcBlock[]>
  submitTransaction(tx: KaspaRestSubmitTxModel, options?: unknown): Promise<KaspaRestSubmitTransactionResponse>
}
```

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

Generic event envelope. The type of `data` depends on the event type.

```ts
interface RpcEvent<T = unknown> {
  type: RpcEventType
  data: T
  timestamp: number  // Unix milliseconds
}
```

---

## AcceptedTransactionInfo

Used by `useTransactionListener().acceptedTransactions`.

```ts
interface AcceptedTransactionInfo {
  transactionId: string
  acceptingBlockHash: string
  senderAddresses: string[]
}
```

---

## TransactionListenerOptions

Options passed to `useTransactionListener()`.

```ts
interface TransactionListenerOptions {
  maxHistory?: number
  autoSubscribe?: boolean
  includeSenderAddresses?: boolean
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `maxHistory` | `number` | `100` | Max accepted transactions to keep |
| `autoSubscribe` | `boolean` | `true` | Subscribe on mount |
| `includeSenderAddresses` | `boolean` | `false` | Resolve sender addresses from the accepting block |

---

## UseTransactionListenerReturn

Returned by `useTransactionListener()`.

```ts
interface UseTransactionListenerReturn {
  transactions: Readonly<Ref<string[]>>
  acceptedTransactions: Readonly<Ref<AcceptedTransactionInfo[]>>
  isListening: ComputedRef<boolean>
  subscribe(): Promise<void>
  unsubscribe(): Promise<void>
  clear(): void
  resolveSenderAddresses(transactionId: string): Promise<string[]>
}
```

| Field | Type | Description |
|---|---|---|
| `transactions` | `Readonly<Ref<string[]>>` | Recently accepted transaction IDs |
| `acceptedTransactions` | `Readonly<Ref<AcceptedTransactionInfo[]>>` | Accepted transactions with sender addresses |
| `isListening` | `ComputedRef<boolean>` | Whether the listener is subscribed |
| `subscribe()` | `Promise<void>` | Start listening for `virtual-chain-changed` |
| `unsubscribe()` | `Promise<void>` | Stop listening |
| `clear()` | `void` | Clear the local history |
| `resolveSenderAddresses(transactionId)` | `Promise<string[]>` | Fetch sender addresses for one tracked transaction |

---

## PaymentOutput

A single recipient in a transaction.

```ts
interface PaymentOutput {
  address: string  // Kaspa address
  amount: bigint   // in sompi
}
```

---

## TransactionSummary

Returned by `useTransaction().estimate()` and `create()`.

```ts
interface TransactionSummary {
  fees: bigint                  // Total fees in sompi
  mass: bigint                  // Total mass in grams
  transactions: number          // Number of transactions (>1 = compounding)
  finalTransactionId?: string   // Set after submission via send()
  finalAmount?: bigint          // Final output amount after fees
}
```

---

## CreateTransactionSettings

Input to `useTransaction().estimate()`, `create()`, and `send()`.

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

| Field | Required | Description |
|---|---|---|
| `entries` | Yes | UTXO inputs — pass `useUtxo().entries.value` |
| `outputs` | No | Recipients. Omit for UTXO self-consolidation. |
| `changeAddress` | Yes | Change return address |
| `priorityFee` | No | Fixed fee in sompi |
| `feeRate` | No | Dynamic fee in sompi/gram (alternative to `priorityFee`) |
| `payload` | No | Hex-encoded data payload |
| `networkId` | No* | Required when `entries` is a plain array |

---

## PendingTx

An unsigned (or partially signed) transaction returned by `useTransaction().create()`.

```ts
interface PendingTx {
  sign(privateKeys: string[]): void
  submit(): Promise<string>
  serialize(): unknown
  addresses(): string[]
}
```

| Method | Description |
|---|---|
| `sign(privateKeys)` | Sign with one or more hex private keys |
| `submit()` | Submit to the network, returns transaction ID |
| `serialize()` | Get a plain object for inspection or external submission |
| `addresses()` | Input addresses — useful for selecting the required signing keys |

---

## KeypairInfo

```ts
interface KeypairInfo {
  privateKeyHex: string   // 32-byte private key as hex
  publicKeyHex: string    // Compressed public key as hex
  address: string         // Network-specific Kaspa address
}
```

---

## MnemonicInfo

```ts
interface MnemonicInfo {
  phrase: string          // Space-separated BIP-39 words
  wordCount: 12 | 24
}
```

---

## DerivedKey

A single key from an HD wallet derivation.

```ts
interface DerivedKey {
  index: number           // Position in the derivation chain (0-based)
  publicKeyHex: string
  address: string
}
```

---

## SignMessageResult

```ts
interface SignMessageResult {
  message: string
  signature: string       // Hex-encoded signature
  publicKeyHex: string
}
```

---

## WalletProvider

```ts
type WalletProvider = 'kasware' | 'kastle'
```

---

## WalletBalance

Balance reported by a connected wallet, in sompi.

```ts
interface WalletBalance {
  confirmed: bigint
  unconfirmed: bigint
  total: bigint
}
```

Populated for KasWare. Always `null` for Kastle (Kastle's API does not expose balance directly).

---

## WalletSendOptions

Options for `useWallet().sendKaspa()`.

```ts
interface WalletSendOptions {
  priorityFee?: bigint  // Extra fee in sompi
  payload?: string      // Hex-encoded data payload
}
```

---

## Composable return types

Each composable has a corresponding return type interface:

| Type | Composable |
|---|---|
| `UseKaspaReturn` | [`useKaspa()`](/composables/use-kaspa) |
| `UseRpcReturn` | [`useRpc()`](/composables/use-rpc) |
| `UseUtxoReturn` | [`useUtxo()`](/composables/use-utxo) |
| `UseTransactionReturn` | [`useTransaction()`](/composables/use-transaction) |
| `UseCryptoReturn` | [`useCrypto()`](/composables/use-crypto) |
| `UseNetworkReturn` | [`useNetwork()`](/composables/use-network) |
| `UseWalletReturn` | [`useWallet()`](/composables/use-wallet) |
| `UseVueKaspaReturn` | [`useVueKaspa()`](/composables/use-vue-kaspa) |

---

## Error classes

All error classes extend `KaspaError` and are exported from `vue-kaspa`. See [Error Handling](/guide/error-handling) for full usage patterns and examples.

### KaspaError

Base class for all Vue Kaspa errors.

```ts
class KaspaError extends Error {
  readonly cause?: unknown
}
```

### KaspaNotReadyError

Thrown when a composable method is called before the WASM module is initialized.

```ts
class KaspaNotReadyError extends KaspaError {}
```

### KaspaRpcError

Thrown when an RPC method call fails.

```ts
class KaspaRpcError extends KaspaError {
  constructor(method: string, cause?: unknown)
}
```

`err.message` is `"RPC method \"<method>\" failed"`. The underlying error is on `err.cause`.

### KaspaWalletError

Thrown when a wallet operation (`connect`, `sendKaspa`, `signMessage`) fails.

```ts
class KaspaWalletError extends KaspaError {
  constructor(operation: string, cause?: unknown)
}
```

`err.message` is `"Wallet operation \"<operation>\" failed"`.

### KaspaCryptoError

Thrown when a cryptographic operation fails.

```ts
class KaspaCryptoError extends KaspaError {
  constructor(operation: string, cause?: unknown)
}
```

`err.message` is `"Crypto operation \"<operation>\" failed"`.
