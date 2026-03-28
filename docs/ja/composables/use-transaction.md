# useTransaction

Kaspa トランザクションを構築、署名、送信します。`@vue-kaspa/kaspa-wasm` の `createTransactions()` と `estimateTransactions()` をラップし、UTXO のコンパウンディングを自動的に処理します。

## インポート

```ts
import { useTransaction } from 'vue-kaspa'
```

## 戻り値の型

```ts
interface UseTransactionReturn {
  estimate(settings: CreateTransactionSettings): Promise<TransactionSummary>
  create(settings: CreateTransactionSettings): Promise<{ transactions: PendingTx[]; summary: TransactionSummary }>
  send(settings: CreateTransactionSettings & { privateKeys: string[] }): Promise<string[]>
}
```

## メソッド

| メソッド | 説明 |
|---|---|
| `estimate(settings)` | ドライラン: 実際のトランザクションを構築せずに手数料とマスを計算する |
| `create(settings)` | 署名待ちの `PendingTx` オブジェクトを構築する |
| `send(settings + privateKeys)` | 一度の呼び出しですべてのトランザクションを構築、署名、送信する |

## CreateTransactionSettings

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `entries` | `UtxoEntry[]` | はい | UTXO 入力 — `useUtxo().entries.value` をそのまま渡せます |
| `outputs` | `PaymentOutput[]` | いいえ | 支払い先。UTXO の集約のみの場合は省略または `[]` を渡す。 |
| `changeAddress` | `string` | はい | お釣りを受け取るアドレス |
| `priorityFee` | `bigint` | いいえ | sompi 単位の優先手数料の合計。`outputs` が指定されている場合は必須。 |
| `feeRate` | `number` | いいえ | マスのグラムあたりの sompi 単位の手数料レート (`priorityFee` の代替) |
| `payload` | `string` | いいえ | オプションの 16 進エンコードされたデータペイロード |
| `networkId` | `string` | いいえ | ネットワーク ID 文字列: `'mainnet'`、`'testnet-10'` など。`entries` が通常の配列の場合に必須。 |

## クイック送信 (ワンショット)

KAS を送る最もシンプルな方法:

```ts
import { useUtxo, useTransaction, useCrypto } from 'vue-kaspa'

const utxo = useUtxo()
const tx = useTransaction()
const crypto = useCrypto()

// 1. Track your address to get UTXOs
await utxo.track(['kaspa:qrsrc...'])

// 2. Send
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

`send()` はトランザクション ID の配列を返します — 送信したトランザクション 1 件につき 1 つ。通常は 1 つですが、UTXO コンパウンディングが必要な場合は複数になることがあります。

## 手数料の見積もり

送信前に手数料を確認する:

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

`estimate()` はドライランです — 実際のトランザクションは構築も送信もされません。

## 手動署名 + 送信 (ハードウェアウォレット)

署名ステップを制御する必要がある場合 (例: ハードウェアウォレットやカスタムキー管理システムを使用する場合) は `create()` を使用します:

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
  // Which addresses need to sign this transaction?
  const signers = pending.addresses()

  // Sign with your key manager
  pending.sign(['your-private-key-hex'])

  // Or inspect the unsigned transaction first
  const raw = pending.serialize()

  // Submit to the network
  const txId = await pending.submit()
  console.log('Submitted:', txId)
}
```

## UTXO コンパウンディング

アドレスが多数の小さな UTXO を保有していてトランザクションがサイズ制限を超える場合、`create()` (および `send()`) は複数のトランザクションを自動生成します:

1. **コンパウンドトランザクション** (N-1 件): UTXO を少数の大きな出力に統合
2. **最終トランザクション** (1 件): 統合された入力による実際の支払い

すべてのトランザクションは順番に送信する必要があります。`send()` はこれを自動的に処理します。`create()` の場合は、配列の順番通りに `transactions` を反復処理してください。

```ts
const { transactions, summary } = await tx.create({ ... })
// summary.transactions > 1 when compounding was needed
// summary.finalTransactionId — set after all are submitted via send()
```

## UTXO 統合 (セルフコンパウンド)

支払いを行わずに多数の小さな UTXO を少数の出力に統合する:

```ts
const txIds = await tx.send({
  entries: utxo.entries.value,
  outputs: [],           // omit outputs or pass empty array
  changeAddress: 'kaspa:qrself...',
  networkId: 'mainnet',
  privateKeys: ['private-key-hex'],
})
```

## 優先手数料の代わりに手数料レートを使用する

現在の手数料見積もりを取得してレートを直接使用する:

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
  fees: bigint              // Total fees in sompi across all transactions
  mass: bigint              // Total mass in grams
  transactions: number      // Number of transactions generated
  finalTransactionId?: string  // Set after submission via send()
  finalAmount?: bigint         // Final output amount after fees
}
```

## PendingTx インターフェース

```ts
interface PendingTx {
  sign(privateKeys: string[]): void    // Sign with hex private keys
  submit(): Promise<string>            // Submit to network, returns txId
  serialize(): unknown                 // Get plain object for inspection
  addresses(): string[]                // Input addresses (for key selection)
}
```
