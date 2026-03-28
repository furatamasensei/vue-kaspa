# useTransaction

Builds, signs, and submits Kaspa transactions. Wraps `kaspa-wasm`'s `createTransactions()` and `estimateTransactions()` and handles UTXO compounding automatically.

## Import

```ts
import { useTransaction } from 'vkas'
```

## Return type

```ts
interface UseTransactionReturn {
  estimate(settings: CreateTransactionSettings): Promise<TransactionSummary>
  create(settings: CreateTransactionSettings): Promise<{ transactions: PendingTx[]; summary: TransactionSummary }>
  send(settings: CreateTransactionSettings & { privateKeys: string[] }): Promise<string[]>
}
```

## Methods

| Method | Description |
|---|---|
| `estimate(settings)` | Dry-run: compute fees and mass without building real transactions |
| `create(settings)` | Build unsigned `PendingTx` objects ready for signing |
| `send(settings + privateKeys)` | Build, sign, and submit all transactions in one call |

## CreateTransactionSettings

| Field | Type | Required | Description |
|---|---|---|---|
| `entries` | `UtxoEntry[]` | Yes | UTXO inputs — pass `useUtxo().entries.value` directly |
| `outputs` | `PaymentOutput[]` | No | Payment recipients. Omit or pass `[]` for UTXO consolidation. |
| `changeAddress` | `string` | Yes | Address to receive change |
| `priorityFee` | `bigint` | No | Total priority fee in sompi. Required when `outputs` is provided. |
| `feeRate` | `number` | No | Fee rate in sompi per gram of mass (alternative to `priorityFee`) |
| `payload` | `string` | No | Optional hex-encoded data payload |
| `networkId` | `string` | No | Network ID string: `'mainnet'`, `'testnet-10'`, etc. Required when `entries` is a plain array. |

## Quick send (one-shot)

The simplest way to send KAS:

```ts
import { useUtxo, useTransaction, useCrypto } from 'vkas'

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

`send()` returns an array of transaction IDs — one per submitted transaction. Usually just one, but may be more when UTXO compounding is required.

## Fee estimation

Check fees before sending:

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

`estimate()` is a dry run — no real transactions are built or submitted.

## Manual sign + submit (hardware wallets)

Use `create()` when you need control over the signing step — for example, when using a hardware wallet or a custom key management system:

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

## UTXO compounding

When an address holds many small UTXOs and the transaction would exceed the size limit, `create()` (and `send()`) automatically generates multiple transactions:

1. **Compound transactions** (N-1): consolidate UTXOs into fewer, larger outputs
2. **Final transaction** (1): the actual payment with consolidated inputs

All transactions must be submitted in order. `send()` handles this automatically. With `create()`, iterate `transactions` in array order.

```ts
const { transactions, summary } = await tx.create({ ... })
// summary.transactions > 1 when compounding was needed
// summary.finalTransactionId — set after all are submitted via send()
```

## UTXO consolidation (self-compound)

Consolidate many small UTXOs into fewer outputs without making a payment:

```ts
const txIds = await tx.send({
  entries: utxo.entries.value,
  outputs: [],           // omit outputs or pass empty array
  changeAddress: 'kaspa:qrself...',
  networkId: 'mainnet',
  privateKeys: ['private-key-hex'],
})
```

## Using fee rate instead of priority fee

Get the current fee estimate and use the rate directly:

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

## PendingTx interface

```ts
interface PendingTx {
  sign(privateKeys: string[]): void    // Sign with hex private keys
  submit(): Promise<string>            // Submit to network, returns txId
  serialize(): unknown                 // Get plain object for inspection
  addresses(): string[]                // Input addresses (for key selection)
}
```
