# useTransaction

建構、簽署並提交 Kaspa 交易。封裝了 `@vue-kaspa/kaspa-wasm` 的 `createTransactions()` 與 `estimateTransactions()`，並自動處理 UTXO 整合。

## 匯入

```ts
import { useTransaction } from 'vue-kaspa'
```

## 回傳型別

```ts
interface UseTransactionReturn {
  estimate(settings: CreateTransactionSettings): Promise<TransactionSummary>
  create(settings: CreateTransactionSettings): Promise<{ transactions: PendingTx[]; summary: TransactionSummary }>
  send(settings: CreateTransactionSettings & { privateKeys: string[] }): Promise<string[]>
}
```

## 方法

| 方法 | 說明 |
|---|---|
| `estimate(settings)` | 試算：計算手續費與質量，不建立實際交易 |
| `create(settings)` | 建構待簽署的 `PendingTx` 物件 |
| `send(settings + privateKeys)` | 一次完成建構、簽署與提交所有交易 |

## CreateTransactionSettings

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `entries` | `UtxoEntry[]` | 是 | UTXO 輸入——可直接傳入 `useUtxo().entries.value` |
| `outputs` | `PaymentOutput[]` | 否 | 付款收款方。省略或傳入 `[]` 以整合 UTXO。 |
| `changeAddress` | `string` | 是 | 接收找零的地址 |
| `priorityFee` | `bigint` | 否 | 以 sompi 計的總優先手續費。提供 `outputs` 時必填。 |
| `feeRate` | `number` | 否 | 以每克質量 sompi 計的手續費率（`priorityFee` 的替代方案） |
| `payload` | `string` | 否 | 選用的十六進位編碼資料酬載 |
| `networkId` | `string` | 否 | 網路 ID 字串：`'mainnet'`、`'testnet-10'` 等。當 `entries` 為純陣列時必填。 |

## 快速發送（單次操作）

發送 KAS 的最簡單方式：

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

`send()` 回傳交易 ID 的陣列——每筆提交的交易一個。通常只有一個，但當需要 UTXO 整合時可能更多。

## 手續費估算

發送前確認手續費：

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

`estimate()` 是試算執行——不建立或提交任何實際交易。

## 手動簽署 + 提交（硬體錢包）

當你需要控制簽署步驟時使用 `create()`——例如使用硬體錢包或自訂金鑰管理系統時：

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

## UTXO 整合

當一個地址持有許多小額 UTXO 且交易超過大小限制時，`create()`（與 `send()`）會自動生成多筆交易：

1. **整合交易**（N-1 筆）：將 UTXO 合併為較少、較大的輸出
2. **最終交易**（1 筆）：使用已整合輸入的實際付款

所有交易必須按順序提交。`send()` 會自動處理此問題。使用 `create()` 時，請按陣列順序迭代 `transactions`。

```ts
const { transactions, summary } = await tx.create({ ... })
// summary.transactions > 1 when compounding was needed
// summary.finalTransactionId — set after all are submitted via send()
```

## UTXO 自我整合

將許多小額 UTXO 整合為較少輸出，而不進行付款：

```ts
const txIds = await tx.send({
  entries: utxo.entries.value,
  outputs: [],           // omit outputs or pass empty array
  changeAddress: 'kaspa:qrself...',
  networkId: 'mainnet',
  privateKeys: ['private-key-hex'],
})
```

## 使用手續費率取代優先手續費

取得目前的手續費估算並直接使用費率：

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

## PendingTx 介面

```ts
interface PendingTx {
  sign(privateKeys: string[]): void    // Sign with hex private keys
  submit(): Promise<string>            // Submit to network, returns txId
  serialize(): unknown                 // Get plain object for inspection
  addresses(): string[]                // Input addresses (for key selection)
}
```
