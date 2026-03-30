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
