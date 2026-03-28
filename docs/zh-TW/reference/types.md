# TypeScript 型別

所有型別均從 `vue-kaspa` 匯出，可供匯入使用：

```ts
import type {
  KaspaPluginOptions,
  KaspaNetwork,
  // ...
} from 'vue-kaspa'
```

---

## KaspaPluginOptions

傳遞給 `app.use(KaspaPlugin, options)` 或 `nuxt.config.ts` 中 `kaspa` 鍵的選項。

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
type KaspaNetwork = 'mainnet' | 'testnet-10' | 'testnet-11' | 'simnet' | 'devnet'
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

`KaspaPluginOptions` 的子集——傳遞給 `useRpc().connect(options?)` 以覆蓋單次連線的插件預設值。

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
  timestamp: number  // Unix milliseconds
}
```

---

## PaymentOutput

交易中的單一收款方。

```ts
interface PaymentOutput {
  address: string  // Kaspa address
  amount: bigint   // in sompi
}
```

---

## TransactionSummary

由 `useTransaction().estimate()` 與 `create()` 回傳。

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

HD 錢包衍生中的單一金鑰。

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
