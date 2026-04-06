# TypeScript 型別

所有型別均從 `vue-kaspa` 匯出，可供匯入使用：

```ts
import type {
  VueKaspaOptions,
  KaspaNetwork,
  // ...
} from 'vue-kaspa'
```

---

## VueKaspaOptions

傳遞給 `app.use(VueKaspa, options)` 或 `nuxt.config.ts` 中 `kaspa` 鍵的選項。

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

| 欄位 | 型別 | 預設值 | 說明 |
|---|---|---|---|
| `network` | `KaspaNetwork` | `'mainnet'` | 要連線的網路 |
| `url` | `string` | — | 自訂 RPC WebSocket URL |
| `resolver` | `boolean` | `true` | 使用公共節點解析器 |
| `encoding` | `RpcEncoding` | `'Borsh'` | 傳輸編碼格式 |
| `autoConnect` | `boolean` | `true` | 安裝時自動初始化 WASM 並連線 |
| `devtools` | `boolean` | 開發環境為 `true` | 啟用 Vue DevTools 整合 |
| `panicHook` | `'console' \| 'browser' \| false` | `'console'` | WASM 崩潰處理器 |

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

`'Borsh'` 是預設的推薦編碼，效能較佳。`'SerdeJson'` 產生人類可讀的 JSON，適合除錯使用。

---

## WasmStatus

```ts
type WasmStatus = 'idle' | 'loading' | 'ready' | 'error'
```

| 值 | 含義 |
|---|---|
| `'idle'` | WASM 尚未啟動 |
| `'loading'` | WASM 模組正在擷取與編譯中 |
| `'ready'` | WASM 已初始化 |
| `'error'` | 初始化失敗 |

---

## RpcConnectionState

```ts
type RpcConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
```

| 值 | 含義 |
|---|---|
| `'disconnected'` | 無連線 |
| `'connecting'` | WebSocket 正在開啟 |
| `'connected'` | 活躍連線中 |
| `'reconnecting'` | 連線中斷後嘗試重連 |
| `'error'` | 達到最大重試次數後連線失敗 |

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

`VueKaspaOptions` 的子集——傳遞給 `useRpc().connect(options?)` 以覆蓋單次連線的插件預設值。

---

## ServerInfo

由 `useRpc().getInfo()` 回傳。

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

由 `useRpc().getBlock(hash)` 回傳。

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

單一 UTXO 輸出。與 `@vue-kaspa/kaspa-wasm` 的 `IUtxoEntry` 相容——可安全直接傳遞給 `createTransactions()`。

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

| 欄位 | 說明 |
|---|---|
| `address` | 所有者地址（腳本輸出可能為 undefined） |
| `outpoint` | 唯一識別此 UTXO 的交易 ID + 輸出索引 |
| `amount` | 以 sompi 計的金額 |
| `scriptPublicKey` | 鎖定腳本 |
| `blockDaaScore` | 包含此輸出的區塊的 DAA 分數 |
| `isCoinbase` | 挖礦獎勵為 `true`（適用成熟度延遲） |

---

## UtxoBalance

由 `useUtxo()` 從已追蹤 UTXO 項目計算的響應式餘額。

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

由 `useRpc().getBalanceByAddress()` 與 `getBalancesByAddresses()` 回傳。

```ts
interface BalanceResult {
  address: string
  balance: bigint  // in sompi
}
```

---

## FeeEstimate

由 `useRpc().getFeeEstimate()` 回傳。提供不同優先級別的手續費率桶。

```ts
interface FeeEstimate {
  priorityBucket: { feerate: number; estimatedSeconds: number }
  normalBuckets:  Array<{ feerate: number; estimatedSeconds: number }>
  lowBuckets:     Array<{ feerate: number; estimatedSeconds: number }>
}
```

`feerate` 以每克交易質量的 sompi 計算。與 `useTransaction()` 的 `feeRate` 設定搭配使用。

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

通用事件信封。`data` 的型別取決於事件類型。

```ts
interface RpcEvent<T = unknown> {
  type: RpcEventType
  data: T
  timestamp: number  // Unix 毫秒
}
```

---

## PaymentOutput

交易中的單一收款方。

```ts
interface PaymentOutput {
  address: string  // Kaspa 地址
  amount: bigint   // in sompi
}
```

---

## TransactionSummary

由 `useTransaction().estimate()` 與 `create()` 回傳。

```ts
interface TransactionSummary {
  fees: bigint                  // sompi 單位的總手續費
  mass: bigint                  // 克單位的總質量
  transactions: number          // 交易數量（>1 = compounding）
  finalTransactionId?: string   // `send()` 送出後設定
  finalAmount?: bigint          // 扣除手續費後的最終輸出金額
}
```

---

## CreateTransactionSettings

`useTransaction().estimate()`、`create()` 與 `send()` 的輸入。

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

| 欄位 | 必填 | 說明 |
|---|---|---|
| `entries` | 是 | UTXO 輸入——傳入 `useUtxo().entries.value` |
| `outputs` | 否 | 收款方。省略則進行 UTXO 自我整合。 |
| `changeAddress` | 是 | 找零回款地址 |
| `priorityFee` | 否 | 以 sompi 計的固定手續費 |
| `feeRate` | 否 | 以 sompi/克計的動態手續費（`priorityFee` 的替代方案） |
| `payload` | 否 | 十六進位編碼的資料酬載 |
| `networkId` | 否* | 當 `entries` 為純陣列時必填 |

---

## PendingTx

由 `useTransaction().create()` 回傳的未簽署（或部分已簽署）交易。

```ts
interface PendingTx {
  sign(privateKeys: string[]): void
  submit(): Promise<string>
  serialize(): unknown
  addresses(): string[]
}
```

| 方法 | 說明 |
|---|---|
| `sign(privateKeys)` | 使用一個或多個十六進位私鑰簽署 |
| `submit()` | 提交至網路，回傳交易 ID |
| `serialize()` | 取得用於檢查或外部提交的純物件 |
| `addresses()` | 輸入地址——用於選取所需的簽署金鑰 |

---

## KeypairInfo

```ts
interface KeypairInfo {
  privateKeyHex: string   // 32-byte private key as hex
  publicKeyHex: string    // 以 hex 表示的壓縮公鑰
  address: string         // 網路專屬的 Kaspa 地址
}
```

---

## MnemonicInfo

```ts
interface MnemonicInfo {
  phrase: string          // 以空格分隔的 BIP-39 詞
  wordCount: 12 | 24
}
```

---

## DerivedKey

HD 錢包衍生中的單一金鑰。

```ts
interface DerivedKey {
  index: number           // 衍生鏈中的位置（從 0 開始）
  publicKeyHex: string
  address: string
}
```

---

## SignMessageResult

```ts
interface SignMessageResult {
  message: string
  signature: string       // 以 hex 編碼的簽章
  publicKeyHex: string
}
```

---

## 可組合函式回傳型別

每個可組合函式都有對應的回傳型別介面：

| 型別 | 可組合函式 |
|---|---|
| `UseKaspaReturn` | [`useKaspa()`](/composables/use-kaspa) |
| `UseRpcReturn` | [`useRpc()`](/composables/use-rpc) |
| `UseUtxoReturn` | [`useUtxo()`](/composables/use-utxo) |
| `UseTransactionReturn` | [`useTransaction()`](/composables/use-transaction) |
| `UseCryptoReturn` | [`useCrypto()`](/composables/use-crypto) |
| `UseNetworkReturn` | [`useNetwork()`](/composables/use-network) |
| `UseVueKaspaReturn` | [`useVueKaspa()`](/composables/use-vue-kaspa) |

## KaspaRestOptions

`useKaspaRest()` 的選項。

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

供 REST composable 使用的每次請求覆寫設定。

```ts
interface KaspaRestRequestOptions {
  forceRefresh?: boolean
  staleTime?: number
  cache?: boolean
}
```

---

## KaspaRestResolvePreviousOutpoints

REST 會解析多少 previous-outpoint 資料。

```ts
type KaspaRestResolvePreviousOutpoints = 'no' | 'light' | 'full'
```

---

## KaspaRestError

REST composable 的請求失敗時會拋出的錯誤。

```ts
class KaspaRestError extends KaspaError {}
```

---

## KaspaRestTransaction

REST composable 回傳的交易 payload。

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

用於 `KaspaRestSubmitTxOutput` 內部。

```ts
interface KaspaRestSubmitTxScriptPublicKey {
  version: number
  scriptPublicKey: string
}
```

---

## KaspaRestSubmitTxOutpoint

用於 `KaspaRestSubmitTxInput` 內部。

```ts
interface KaspaRestSubmitTxOutpoint {
  transactionId: string
  index: number
}
```

---

## KaspaRestSubmitTxInput

用於 `KaspaRestSubmitTxModel` 內部。

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

用於 `KaspaRestSubmitTxModel` 內部。

```ts
interface KaspaRestSubmitTxOutput {
  amount: number
  scriptPublicKey: KaspaRestSubmitTxScriptPublicKey
}
```

---

## KaspaRestTxSearch

`searchTransactions()` 的請求主體。

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

`KaspaRestTxSearch` 使用的篩選物件。

```ts
interface KaspaRestTxSearchAcceptingBlueScores {
  gte: number
  lt: number
}
```

---

## KaspaRestSubmitTxModel

`submitTransaction()` 與 `calculateTransactionMass()` 接受的交易 payload。

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

送往 REST `POST /transactions` 端點的主體。

```ts
interface KaspaRestSubmitTransactionRequest {
  transaction: KaspaRestSubmitTxModel
  allowOrphan?: boolean
}
```

---

## KaspaRestSubmitTransactionResponse

`submitTransaction()` 的回傳值。

```ts
interface KaspaRestSubmitTransactionResponse {
  transactionId?: string
  error?: string
}
```

---

## KaspaRestTxMass

`calculateTransactionMass()` 的回傳值。

```ts
interface KaspaRestTxMass {
  mass: number
  storage_mass: number
  compute_mass: number
}
```

---

## KaspaRestTransactionAcceptance

`getTransactionAcceptance()` 的回傳值。

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

實驗性 `POST /addresses/active` 端點的回傳值。

```ts
interface KaspaRestAddressesActiveResponse {
  address: string
  active: boolean
  lastTxBlockTime?: number
}
```

---

## KaspaRestAddressesActiveCountResponse

回傳值: 實驗性的 active-address count 端點。

```ts
interface KaspaRestAddressesActiveCountResponse {
  timestamp: number
  dateTime: string
  count: number
}
```

---

## KaspaRestDistributionTier

供 `KaspaRestDistributionTiers`.

```ts
interface KaspaRestDistributionTier {
  tier: number
  count: number
  amount: number
}
```

---

## KaspaRestDistributionTiers

回傳值: 實驗性的 address distribution 端點。

```ts
interface KaspaRestDistributionTiers {
  timestamp: number
  tiers: KaspaRestDistributionTier[]
}
```

---

## KaspaRestOutpoint

供 `KaspaRestUtxoResponse`.

```ts
interface KaspaRestOutpoint {
  transactionId?: string
  index?: number
}
```

---

## KaspaRestScriptPublicKey

供 `KaspaRestUtxoModel`.

```ts
interface KaspaRestScriptPublicKey {
  version?: number
  script?: string
}
```

---

## KaspaRestUtxoModel

供 `KaspaRestUtxoResponse`.

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

回傳值: `useKaspaRest().getUtxoCountByAddress()`.

```ts
interface KaspaRestUtxoCountResponse {
  count: number
}
```

---

## KaspaRestBalancesByAddressEntry

回傳值: `useKaspaRest().getBalancesByAddresses()`.

```ts
interface KaspaRestBalancesByAddressEntry {
  address: string
  balance: number
}
```

---

## KaspaRestBlockHeader

供 `KaspaRestBlock` 和 `KaspaRestMaxHashrateResponse` 使用。

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

供 `KaspaRestBlockHeader`.

```ts
interface KaspaRestParentHash {
  parentHashes?: string[]
}
```

---

## KaspaRestVerboseData

供 `KaspaRestBlock`.

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

供 `KaspaRestBlockTxInput`.

```ts
interface KaspaRestBlockTxInputPreviousOutpoint {
  transactionId?: string
  index?: number
}
```

---

## KaspaRestBlockTxInput

供 `KaspaRestBlockTx`.

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

供 `KaspaRestBlockTxOutput`.

```ts
interface KaspaRestBlockTxOutputScriptPublicKey {
  scriptPublicKey?: string
  version?: number
}
```

---

## KaspaRestBlockTxOutputVerboseData

供 `KaspaRestBlockTxOutput`.

```ts
interface KaspaRestBlockTxOutputVerboseData {
  scriptPublicKeyType?: string
  scriptPublicKeyAddress?: string
}
```

---

## KaspaRestBlockTxOutput

供 `KaspaRestBlockTx`.

```ts
interface KaspaRestBlockTxOutput {
  amount?: number
  scriptPublicKey?: KaspaRestBlockTxOutputScriptPublicKey
  verboseData?: KaspaRestBlockTxOutputVerboseData
}
```

---

## KaspaRestBlockTxVerboseData

供 `KaspaRestBlockTx`.

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

供 `KaspaRestBlock`.

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

回傳值: `useKaspaRest().getBlock()`.

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

回傳值: `useKaspaRest().getBlocks()`.

```ts
interface KaspaRestBlockResponse {
  blockHashes?: string[]
  blocks?: KaspaRestBlock[]
}
```

---

## KaspaRestBlueScoreResponse

回傳值: `useKaspaRest().getVirtualSelectedParentBlueScore()`.

```ts
interface KaspaRestBlueScoreResponse {
  blueScore: number
}
```

---

## KaspaRestBlockdagResponse

回傳值: `useKaspaRest().getBlockDag()` 和 `getNetwork()`。

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

回傳值: `useKaspaRest().getCoinSupply()`.

```ts
interface KaspaRestCoinSupplyResponse {
  circulatingSupply: string
  maxSupply: string
}
```

---

## KaspaRestBlockRewardResponse

回傳值: `useKaspaRest().getBlockReward()`.

```ts
interface KaspaRestBlockRewardResponse {
  blockreward: number
}
```

---

## KaspaRestHalvingResponse

回傳值: `useKaspaRest().getHalving()`.

```ts
interface KaspaRestHalvingResponse {
  nextHalvingTimestamp: number
  nextHalvingDate: string
  nextHalvingAmount: number
}
```

---

## KaspaRestHashrateResponse

回傳值: `useKaspaRest().getHashrate()`.

```ts
interface KaspaRestHashrateResponse {
  hashrate: number
}
```

---

## KaspaRestMaxHashrateResponse

回傳值: `useKaspaRest().getMaxHashrate()`.

```ts
interface KaspaRestMaxHashrateResponse {
  hashrate?: number
  blockheader: KaspaRestBlockHeader
}
```

---

## KaspaRestHashrateHistoryResponse

回傳值: `useKaspaRest().getHashrateHistory()` 和 `getHashrateHistoryFor()`。

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

供 `KaspaRestHealthResponse`.

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

供 `KaspaRestHealthResponse`.

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

回傳值: `useKaspaRest().getHealth()`.

```ts
interface KaspaRestHealthResponse {
  kaspadServers: KaspaRestKaspadResponse[]
  database: KaspaRestDBCheckStatus
}
```

---

## KaspaRestKaspadInfoResponse

回傳值: `useKaspaRest().getKaspadInfo()`.

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

供原生 REST `GET /info/price` 端點，透過 `request()` 使用。

```ts
interface KaspaRestPriceResponse {
  price: number
}
```

---

## KaspaRestMarketCapResponse

回傳值: 當回應為 JSON 時的 `useKaspaRest().getMarketcap()`。

```ts
interface KaspaRestMarketCapResponse {
  marketcap: number
}
```

---

## KaspaRestUtxoResponse

回傳值: `useKaspaRest().getUtxosByAddress()` 和 `getUtxosByAddresses()`。

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

回傳值: `useKaspaRest().getAddressBalance()`.

```ts
interface KaspaRestBalanceResponse {
  address: string
  balance: number
}
```

---

## KaspaRestAddressBalanceHistory

回傳值: `useKaspaRest().getAddressBalanceHistory()`.

```ts
interface KaspaRestAddressBalanceHistory {
  timestamp: number
  amount: number
}
```

---

## KaspaRestAddressName

回傳值: `useKaspaRest().getAddressName()` 和 `getAddressNames()`。

```ts
interface KaspaRestAddressName {
  address: string
  name: string
}
```

---

## KaspaRestTopAddresses

回傳值: `useKaspaRest().getTopAddresses()`.

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

供 `KaspaRestTopAddresses`.

```ts
interface KaspaRestTopAddress {
  rank: number
  address: string
  amount: number
}
```

---

## KaspaRestTransactionCount

回傳值: `useKaspaRest().getAddressTransactionCount()`.

```ts
interface KaspaRestTransactionCount {
  total: number
}
```

---

## KaspaRestTransactionCountResponse

回傳值: 實驗性的 transaction count 端點。

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

回傳值: `useKaspaRest().getVirtualChain()`.

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

供 `KaspaRestVcTx`.

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

供 `KaspaRestVcTx`.

```ts
interface KaspaRestVcTxOutput {
  script_public_key: string
  script_public_key_address: string
  amount: number
}
```

---

## KaspaRestVcTx

供 `KaspaRestVcBlock`.

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

回傳值: `useKaspaRest().getBalancesByAddresses()`.

```ts
interface KaspaRestBalanceEntry {
  address: string
  balance: number
}
```

---

## UseKaspaRestReturn

回傳值: `useKaspaRest()`.

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

通用事件信封。`data` 的型別取決於事件類型。

```ts
interface RpcEvent<T = unknown> {
  type: RpcEventType
  data: T
  timestamp: number  // Unix 毫秒
}
```

---

## AcceptedTransactionInfo

供 `useTransactionListener().acceptedTransactions`.

```ts
interface AcceptedTransactionInfo {
  transactionId: string
  acceptingBlockHash: string
  senderAddresses: string[]
}
```

---

## TransactionListenerOptions

`useTransactionListener()` 的選項。

```ts
interface TransactionListenerOptions {
  maxHistory?: number
  autoSubscribe?: boolean
  includeSenderAddresses?: boolean
}
```

| 欄位 | 型別 | 預設值 | 說明 |
|---|---|---|---|
| `maxHistory` | `number` | `100` | 保留的已接受交易最大數量 |
| `autoSubscribe` | `boolean` | `true` | 掛載時自動訂閱 |
| `includeSenderAddresses` | `boolean` | `false` | 從接受區塊解析 sender addresses |

---

## UseTransactionListenerReturn

回傳值: `useTransactionListener()`.

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

| 欄位 | 型別 | 說明 |
|---|---|---|
| `transactions` | `Readonly<Ref<string[]>>` | 最近被接受的交易 ID |
| `acceptedTransactions` | `Readonly<Ref<AcceptedTransactionInfo[]>>` | 含 sender addresses 的已接受交易 |
| `isListening` | `ComputedRef<boolean>` | 是否正在訂閱 |
| `subscribe()` | `Promise<void>` | 開始監聽 `virtual-chain-changed` |
| `unsubscribe()` | `Promise<void>` | 停止監聽 |
| `clear()` | `void` | 清除本地歷史 |
| `resolveSenderAddresses(transactionId)` | `Promise<string[]>` | 取得單一追蹤交易的 sender addresses |

---

## PaymentOutput

交易中的單一收款方。

```ts
interface PaymentOutput {
  address: string  // Kaspa 地址
  amount: bigint   // in sompi
}
```

---

## TransactionSummary

`useTransaction().estimate()` 與 `create()` 的回傳值。

```ts
interface TransactionSummary {
  fees: bigint                  // sompi 單位的總手續費
  mass: bigint                  // 克單位的總質量
  transactions: number          // 交易數量（>1 = compounding）
  finalTransactionId?: string   // `send()` 送出後設定
  finalAmount?: bigint          // 扣除手續費後的最終輸出金額
}
```

---

## CreateTransactionSettings

`useTransaction().estimate()`、`create()` 與 `send()` 的輸入。

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

| 欄位 | 必填 | 說明 |
|---|---|---|
| `entries` | 是 | UTXO 輸入 — 請傳入 `useUtxo().entries.value` |
| `outputs` | 否 | 收款方。若是 UTXO 自我整合可省略。 |
| `changeAddress` | 是 | 找零回傳地址 |
| `priorityFee` | 否 | 以 sompi 計算的固定費用 |
| `feeRate` | 否 | 以 sompi/克計算的動態費用（`priorityFee` 的替代方案） |
| `payload` | 否 | 十六進位編碼的資料 payload |
| `networkId` | 否* | 當 `entries` 是一般陣列時必填 |

---

## PendingTx

`useTransaction().create()` 回傳的未簽署（或部分簽署）交易。

```ts
interface PendingTx {
  sign(privateKeys: string[]): void
  submit(): Promise<string>
  serialize(): unknown
  addresses(): string[]
}
```

| 方法 | 說明 |
|---|---|
| `sign(privateKeys)` | 使用一或多個 hex 私鑰簽署 |
| `submit()` | 送出到網路，並回傳交易 ID |
| `serialize()` | 取得供檢查或外部送出的純物件 |
| `addresses()` | 輸入地址 — 有助於挑選所需的簽署金鑰 |

---

## KeypairInfo

```ts
interface KeypairInfo {
  privateKeyHex: string   // 32-byte private key as hex
  publicKeyHex: string    // 以 hex 表示的壓縮公鑰
  address: string         // 網路專屬的 Kaspa 地址
}
```

---

## MnemonicInfo

```ts
interface MnemonicInfo {
  phrase: string          // 以空格分隔的 BIP-39 詞
  wordCount: 12 | 24
}
```

---

## DerivedKey

HD 錢包衍生出的單一金鑰。

```ts
interface DerivedKey {
  index: number           // 衍生鏈中的位置（從 0 開始）
  publicKeyHex: string
  address: string
}
```

---

## SignMessageResult

```ts
interface SignMessageResult {
  message: string
  signature: string       // 以 hex 編碼的簽章
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

連線錢包回報的餘額，單位為 sompi。

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

的選項: `useWallet().sendKaspa()`.

```ts
interface WalletSendOptions {
  priorityFee?: bigint  // sompi 單位的額外手續費
  payload?: string      // 以 hex 編碼的資料 payload
}
```

---

## 可組合函式回傳型別

每個 composable 都有對應的回傳型別介面：

| 型別 | 可組合函式 |
|---|---|
| `UseKaspaReturn` | [`useKaspa()`](/composables/use-kaspa) |
| `UseRpcReturn` | [`useRpc()`](/composables/use-rpc) |
| `UseUtxoReturn` | [`useUtxo()`](/composables/use-utxo) |
| `UseTransactionReturn` | [`useTransaction()`](/composables/use-transaction) |
| `UseCryptoReturn` | [`useCrypto()`](/composables/use-crypto) |
| `UseNetworkReturn` | [`useNetwork()`](/composables/use-network) |
| `UseWalletReturn` | [`useWallet()`](/zh-TW/composables/use-wallet) |
| `UseVueKaspaReturn` | [`useVueKaspa()`](/zh-TW/composables/use-vue-kaspa) |

---

## 錯誤類別

所有錯誤類別都繼承自 `KaspaError`，並由 `vue-kaspa` 匯出。使用模式與範例請參考 [Error Handling](/guide/error-handling)。

### KaspaError

所有 Vue Kaspa 錯誤的基底類別。

```ts
class KaspaError extends Error {
  readonly cause?: unknown
}
```

### KaspaNotReadyError

當在 WASM 模組初始化前呼叫 composable 方法時拋出。

```ts
class KaspaNotReadyError extends KaspaError {}
```

### KaspaRpcError

當 RPC 方法呼叫失敗時拋出。

```ts
class KaspaRpcError extends KaspaError {
  constructor(method: string, cause?: unknown)
}
```

`err.message` 是 `"RPC method \"<method>\" failed"`。底層錯誤在 `err.cause`。

### KaspaWalletError

當錢包操作 (`connect`、`sendKaspa`、`signMessage`) 失敗時拋出。

```ts
class KaspaWalletError extends KaspaError {
  constructor(operation: string, cause?: unknown)
}
```

`err.message` 是 `"Wallet operation \"<operation>\" failed"`。

### KaspaCryptoError

當密碼學操作失敗時拋出。

```ts
class KaspaCryptoError extends KaspaError {
  constructor(operation: string, cause?: unknown)
}
```

`err.message` 是 `"Crypto operation \"<operation>\" failed"`。
