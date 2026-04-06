# TypeScript 型

すべての型は `vue-kaspa` からエクスポートされており、インポートして使用できます:

```ts
import type {
  VueKaspaOptions,
  KaspaNetwork,
  // ...
} from 'vue-kaspa'
```

---

## VueKaspaOptions

`app.use(VueKaspa, options)` または `nuxt.config.ts` の `kaspa` キーに渡すオプションです。

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

| フィールド | 型 | デフォルト | 説明 |
|---|---|---|---|
| `network` | `KaspaNetwork` | `'mainnet'` | 接続するネットワーク |
| `url` | `string` | — | カスタム RPC WebSocket URL |
| `resolver` | `boolean` | `true` | 公開ノードリゾルバーを使用する |
| `encoding` | `RpcEncoding` | `'Borsh'` | ワイヤーエンコーディング形式 |
| `autoConnect` | `boolean` | `true` | インストール時に WASM の自動初期化と接続を行う |
| `devtools` | `boolean` | 開発時は `true` | Vue DevTools 統合を有効にする |
| `panicHook` | `'console' \| 'browser' \| false` | `'console'` | WASM パニックハンドラー |

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

`'Borsh'` はパフォーマンスの観点からデフォルトかつ推奨のエンコーディングです。`'SerdeJson'` は人間が読める JSON を生成し、デバッグに便利です。

---

## WasmStatus

```ts
type WasmStatus = 'idle' | 'loading' | 'ready' | 'error'
```

| 値 | 意味 |
|---|---|
| `'idle'` | WASM 未開始 |
| `'loading'` | WASM モジュールをフェッチ・コンパイル中 |
| `'ready'` | WASM 初期化完了 |
| `'error'` | 初期化失敗 |

---

## RpcConnectionState

```ts
type RpcConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
```

| 値 | 意味 |
|---|---|
| `'disconnected'` | 接続なし |
| `'connecting'` | WebSocket を開いている |
| `'connected'` | アクティブな接続中 |
| `'reconnecting'` | 切断後に再接続を試みている |
| `'error'` | 最大リトライ回数後に接続失敗 |

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

`VueKaspaOptions` のサブセット — 単一の接続でプラグインのデフォルトを上書きするために `useRpc().connect(options?)` に渡します。

---

## ServerInfo

`useRpc().getInfo()` が返す型です。

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

`useRpc().getBlock(hash)` が返す型です。

```ts
interface BlockInfo {
  hash: string
  timestamp: number
  blueScore: bigint
  transactions: string[]  // transaction IDs
}
```

---

## UtxoEntry

単一の UTXO 出力です。`@vue-kaspa/kaspa-wasm` の `IUtxoEntry` と互換性があります — `createTransactions()` に直接渡すことができます。

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

| フィールド | 説明 |
|---|---|
| `address` | 所有者アドレス (スクリプト出力の場合は undefined の可能性あり) |
| `outpoint` | この UTXO を一意に識別するトランザクション ID + 出力インデックス |
| `amount` | sompi 単位の金額 |
| `scriptPublicKey` | ロッキングスクリプト |
| `blockDaaScore` | この出力を含むブロックの DAA スコア |
| `isCoinbase` | マイニング報酬の場合 `true` (満期遅延が適用される) |

---

## UtxoBalance

`useUtxo()` が追跡した UTXO エントリから計算するリアクティブな残高です。

```ts
interface UtxoBalance {
  mature: bigint    // Confirmed, spendable (non-coinbase)
  pending: bigint   // Coinbase with maturity delay, or unconfirmed incoming
  outgoing: bigint  // Always 0n (reserved)
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

`useRpc().getBalanceByAddress()` および `getBalancesByAddresses()` が返す型です。

```ts
interface BalanceResult {
  address: string
  balance: bigint  // in sompi
}
```

---

## FeeEstimate

`useRpc().getFeeEstimate()` が返す型です。異なる優先度レベルの手数料レートバケットを提供します。

```ts
interface FeeEstimate {
  priorityBucket: { feerate: number; estimatedSeconds: number }
  normalBuckets:  Array<{ feerate: number; estimatedSeconds: number }>
  lowBuckets:     Array<{ feerate: number; estimatedSeconds: number }>
}
```

`feerate` はトランザクションマスのグラムあたりの sompi 単位です。`useTransaction()` の `feeRate` 設定と合わせて使用します。

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

汎用イベントエンベロープです。`data` の型はイベントの種類によって異なります。

```ts
interface RpcEvent<T = unknown> {
  type: RpcEventType
  data: T
  timestamp: number  // Unix milliseconds
}
```

---

## PaymentOutput

トランザクション内の単一の受取人です。

```ts
interface PaymentOutput {
  address: string  // Kaspa address
  amount: bigint   // in sompi
}
```

---

## TransactionSummary

`useTransaction().estimate()` および `create()` が返す型です。

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

`useTransaction().estimate()`、`create()`、`send()` への入力です。

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

| フィールド | 必須 | 説明 |
|---|---|---|
| `entries` | はい | UTXO 入力 — `useUtxo().entries.value` を渡す |
| `outputs` | いいえ | 受取人。UTXO セルフ統合の場合は省略。 |
| `changeAddress` | はい | お釣りの返送先アドレス |
| `priorityFee` | いいえ | sompi 単位の固定手数料 |
| `feeRate` | いいえ | sompi/グラム単位の動的手数料 (`priorityFee` の代替) |
| `payload` | いいえ | 16 進エンコードされたデータペイロード |
| `networkId` | いいえ* | `entries` が通常の配列の場合に必須 |

---

## PendingTx

`useTransaction().create()` が返す未署名 (または部分署名済み) のトランザクションです。

```ts
interface PendingTx {
  sign(privateKeys: string[]): void
  submit(): Promise<string>
  serialize(): unknown
  addresses(): string[]
}
```

| メソッド | 説明 |
|---|---|
| `sign(privateKeys)` | 1 つ以上の 16 進秘密鍵で署名する |
| `submit()` | ネットワークに送信し、トランザクション ID を返す |
| `serialize()` | 検査または外部送信用のプレーンオブジェクトを取得する |
| `addresses()` | 入力アドレス — 必要な署名鍵の選択に便利 |

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

HD ウォレット導出から得られる単一のキーです。

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

## コンポーザブルの戻り値型

各コンポーザブルには対応する戻り値型インターフェースがあります:

| 型 | コンポーザブル |
|---|---|
| `UseKaspaReturn` | [`useKaspa()`](/ja/composables/use-kaspa) |
| `UseRpcReturn` | [`useRpc()`](/ja/composables/use-rpc) |
| `UseUtxoReturn` | [`useUtxo()`](/ja/composables/use-utxo) |
| `UseTransactionReturn` | [`useTransaction()`](/ja/composables/use-transaction) |
| `UseCryptoReturn` | [`useCrypto()`](/ja/composables/use-crypto) |
| `UseNetworkReturn` | [`useNetwork()`](/ja/composables/use-network) |
| `UseVueKaspaReturn` | [`useVueKaspa()`](/ja/composables/use-vue-kaspa) |

## KaspaRestOptions

`useKaspaRest()` に渡すオプション。

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

REST コンポーザブル向けの各リクエスト上書き設定です。

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

〜の戻り値: `submitTransaction()`.

```ts
interface KaspaRestSubmitTransactionResponse {
  transactionId?: string
  error?: string
}
```

---

## KaspaRestTxMass

〜の戻り値: `calculateTransactionMass()`.

```ts
interface KaspaRestTxMass {
  mass: number
  storage_mass: number
  compute_mass: number
}
```

---

## KaspaRestTransactionAcceptance

〜の戻り値: `getTransactionAcceptance()`.

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

〜の戻り値: the experimental `POST /addresses/active` endpoint.

```ts
interface KaspaRestAddressesActiveResponse {
  address: string
  active: boolean
  lastTxBlockTime?: number
}
```

---

## KaspaRestAddressesActiveCountResponse

〜の戻り値: the experimental active-address count endpoints.

```ts
interface KaspaRestAddressesActiveCountResponse {
  timestamp: number
  dateTime: string
  count: number
}
```

---

## KaspaRestDistributionTier

〜で使用: `KaspaRestDistributionTiers`.

```ts
interface KaspaRestDistributionTier {
  tier: number
  count: number
  amount: number
}
```

---

## KaspaRestDistributionTiers

〜の戻り値: the experimental address distribution endpoint.

```ts
interface KaspaRestDistributionTiers {
  timestamp: number
  tiers: KaspaRestDistributionTier[]
}
```

---

## KaspaRestOutpoint

〜で使用: `KaspaRestUtxoResponse`.

```ts
interface KaspaRestOutpoint {
  transactionId?: string
  index?: number
}
```

---

## KaspaRestScriptPublicKey

〜で使用: `KaspaRestUtxoModel`.

```ts
interface KaspaRestScriptPublicKey {
  version?: number
  script?: string
}
```

---

## KaspaRestUtxoModel

〜で使用: `KaspaRestUtxoResponse`.

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

〜の戻り値: `useKaspaRest().getUtxoCountByAddress()`.

```ts
interface KaspaRestUtxoCountResponse {
  count: number
}
```

---

## KaspaRestBalancesByAddressEntry

〜の戻り値: `useKaspaRest().getBalancesByAddresses()`.

```ts
interface KaspaRestBalancesByAddressEntry {
  address: string
  balance: number
}
```

---

## KaspaRestBlockHeader

〜で使用: `KaspaRestBlock` and `KaspaRestMaxHashrateResponse`.

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

〜で使用: `KaspaRestBlockHeader`.

```ts
interface KaspaRestParentHash {
  parentHashes?: string[]
}
```

---

## KaspaRestVerboseData

〜で使用: `KaspaRestBlock`.

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

〜で使用: `KaspaRestBlockTxInput`.

```ts
interface KaspaRestBlockTxInputPreviousOutpoint {
  transactionId?: string
  index?: number
}
```

---

## KaspaRestBlockTxInput

〜で使用: `KaspaRestBlockTx`.

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

〜で使用: `KaspaRestBlockTxOutput`.

```ts
interface KaspaRestBlockTxOutputScriptPublicKey {
  scriptPublicKey?: string
  version?: number
}
```

---

## KaspaRestBlockTxOutputVerboseData

〜で使用: `KaspaRestBlockTxOutput`.

```ts
interface KaspaRestBlockTxOutputVerboseData {
  scriptPublicKeyType?: string
  scriptPublicKeyAddress?: string
}
```

---

## KaspaRestBlockTxOutput

〜で使用: `KaspaRestBlockTx`.

```ts
interface KaspaRestBlockTxOutput {
  amount?: number
  scriptPublicKey?: KaspaRestBlockTxOutputScriptPublicKey
  verboseData?: KaspaRestBlockTxOutputVerboseData
}
```

---

## KaspaRestBlockTxVerboseData

〜で使用: `KaspaRestBlockTx`.

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

〜で使用: `KaspaRestBlock`.

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

〜の戻り値: `useKaspaRest().getBlock()`.

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

〜の戻り値: `useKaspaRest().getBlocks()`.

```ts
interface KaspaRestBlockResponse {
  blockHashes?: string[]
  blocks?: KaspaRestBlock[]
}
```

---

## KaspaRestBlueScoreResponse

〜の戻り値: `useKaspaRest().getVirtualSelectedParentBlueScore()`.

```ts
interface KaspaRestBlueScoreResponse {
  blueScore: number
}
```

---

## KaspaRestBlockdagResponse

〜の戻り値: `useKaspaRest().getBlockDag()` and `getNetwork()`.

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

〜の戻り値: `useKaspaRest().getCoinSupply()`.

```ts
interface KaspaRestCoinSupplyResponse {
  circulatingSupply: string
  maxSupply: string
}
```

---

## KaspaRestBlockRewardResponse

〜の戻り値: `useKaspaRest().getBlockReward()`.

```ts
interface KaspaRestBlockRewardResponse {
  blockreward: number
}
```

---

## KaspaRestHalvingResponse

〜の戻り値: `useKaspaRest().getHalving()`.

```ts
interface KaspaRestHalvingResponse {
  nextHalvingTimestamp: number
  nextHalvingDate: string
  nextHalvingAmount: number
}
```

---

## KaspaRestHashrateResponse

〜の戻り値: `useKaspaRest().getHashrate()`.

```ts
interface KaspaRestHashrateResponse {
  hashrate: number
}
```

---

## KaspaRestMaxHashrateResponse

〜の戻り値: `useKaspaRest().getMaxHashrate()`.

```ts
interface KaspaRestMaxHashrateResponse {
  hashrate?: number
  blockheader: KaspaRestBlockHeader
}
```

---

## KaspaRestHashrateHistoryResponse

〜の戻り値: `useKaspaRest().getHashrateHistory()` and `getHashrateHistoryFor()`.

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

〜で使用: `KaspaRestHealthResponse`.

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

〜で使用: `KaspaRestHealthResponse`.

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

〜の戻り値: `useKaspaRest().getHealth()`.

```ts
interface KaspaRestHealthResponse {
  kaspadServers: KaspaRestKaspadResponse[]
  database: KaspaRestDBCheckStatus
}
```

---

## KaspaRestKaspadInfoResponse

〜の戻り値: `useKaspaRest().getKaspadInfo()`.

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

〜で使用: the raw REST `GET /info/price` endpoint via `request()`.

```ts
interface KaspaRestPriceResponse {
  price: number
}
```

---

## KaspaRestMarketCapResponse

〜の戻り値: `useKaspaRest().getMarketcap()` when the response is JSON.

```ts
interface KaspaRestMarketCapResponse {
  marketcap: number
}
```

---

## KaspaRestUtxoResponse

〜の戻り値: `useKaspaRest().getUtxosByAddress()` and `getUtxosByAddresses()`.

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

〜の戻り値: `useKaspaRest().getAddressBalance()`.

```ts
interface KaspaRestBalanceResponse {
  address: string
  balance: number
}
```

---

## KaspaRestAddressBalanceHistory

〜の戻り値: `useKaspaRest().getAddressBalanceHistory()`.

```ts
interface KaspaRestAddressBalanceHistory {
  timestamp: number
  amount: number
}
```

---

## KaspaRestAddressName

〜の戻り値: `useKaspaRest().getAddressName()` and `getAddressNames()`.

```ts
interface KaspaRestAddressName {
  address: string
  name: string
}
```

---

## KaspaRestTopAddresses

〜の戻り値: `useKaspaRest().getTopAddresses()`.

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

〜で使用: `KaspaRestTopAddresses`.

```ts
interface KaspaRestTopAddress {
  rank: number
  address: string
  amount: number
}
```

---

## KaspaRestTransactionCount

〜の戻り値: `useKaspaRest().getAddressTransactionCount()`.

```ts
interface KaspaRestTransactionCount {
  total: number
}
```

---

## KaspaRestTransactionCountResponse

〜の戻り値: the experimental transaction count endpoints.

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

〜の戻り値: `useKaspaRest().getVirtualChain()`.

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

〜で使用: `KaspaRestVcTx`.

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

〜で使用: `KaspaRestVcTx`.

```ts
interface KaspaRestVcTxOutput {
  script_public_key: string
  script_public_key_address: string
  amount: number
}
```

---

## KaspaRestVcTx

〜で使用: `KaspaRestVcBlock`.

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

〜の戻り値: `useKaspaRest().getBalancesByAddresses()`.

```ts
interface KaspaRestBalanceEntry {
  address: string
  balance: number
}
```

---

## UseKaspaRestReturn

〜の戻り値: `useKaspaRest()`.

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

〜で使用: `useTransactionListener().acceptedTransactions`.

```ts
interface AcceptedTransactionInfo {
  transactionId: string
  acceptingBlockHash: string
  senderAddresses: string[]
}
```

---

## TransactionListenerOptions

`useTransactionListener()` に渡すオプションです。

```ts
interface TransactionListenerOptions {
  maxHistory?: number
  autoSubscribe?: boolean
  includeSenderAddresses?: boolean
}
```

| フィールド | 型 | 既定値 | 説明 |
|---|---|---|---|
| `maxHistory` | `number` | `100` | Max accepted transactions to keep |
| `autoSubscribe` | `boolean` | `true` | Subscribe on mount |
| `includeSenderAddresses` | `boolean` | `false` | Resolve sender addresses from the accepting block |

---

## UseTransactionListenerReturn

〜の戻り値: `useTransactionListener()`.

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

| フィールド | 型 | 説明 |
|---|---|---|
| `transactions` | `Readonly<Ref<string[]>>` | 最近受理されたトランザクション ID |
| `acceptedTransactions` | `Readonly<Ref<AcceptedTransactionInfo[]>>` | 送信元アドレス付きの受理済みトランザクション |
| `isListening` | `ComputedRef<boolean>` | リスナーが購読中かどうか |
| `subscribe()` | `Promise<void>` | `virtual-chain-changed` の監視を開始する |
| `unsubscribe()` | `Promise<void>` | 監視を停止する |
| `clear()` | `void` | ローカル履歴を消去する |
| `resolveSenderAddresses(transactionId)` | `Promise<string[]>` | 追跡中のトランザクション 1 件の送信元アドレスを取得する |

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

〜の戻り値: `useTransaction().estimate()` and `create()`.

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

| フィールド | 必須 | 説明 |
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

| メソッド | 説明 |
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

〜のオプション: `useWallet().sendKaspa()`.

```ts
interface WalletSendOptions {
  priorityFee?: bigint  // Extra fee in sompi
  payload?: string      // Hex-encoded data payload
}
```

---

## コンポーザブルの戻り値型

各 composable には対応する戻り値型インターフェースがあります:

| 型 | コンポーザブル |
|---|---|
| `UseKaspaReturn` | [`useKaspa()`](/composables/use-kaspa) |
| `UseRpcReturn` | [`useRpc()`](/composables/use-rpc) |
| `UseUtxoReturn` | [`useUtxo()`](/composables/use-utxo) |
| `UseTransactionReturn` | [`useTransaction()`](/composables/use-transaction) |
| `UseCryptoReturn` | [`useCrypto()`](/composables/use-crypto) |
| `UseNetworkReturn` | [`useNetwork()`](/composables/use-network) |
| `UseWalletReturn` | [`useWallet()`](/ja/composables/use-wallet) |
| `UseVueKaspaReturn` | [`useVueKaspa()`](/ja/composables/use-vue-kaspa) |

---

## エラークラス

すべてのエラークラスは `KaspaError` を継承し、`vue-kaspa` からエクスポートされます。 See [Error Handling](/guide/error-handling) for full usage patterns and examples.

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
