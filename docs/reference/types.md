# TypeScript Types

All types are exported from `vue-kaspa` and available for import:

```ts
import type {
  KaspaPluginOptions,
  KaspaNetwork,
  // ...
} from 'vue-kaspa'
```

---

## KaspaPluginOptions

Options passed to `app.use(KaspaPlugin, options)` or the `kaspa` key in `nuxt.config.ts`.

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

| Field | Type | Default | Description |
|---|---|---|---|
| `network` | `KaspaNetwork` | `'mainnet'` | Network to connect to |
| `url` | `string` | — | Custom RPC WebSocket URL |
| `resolver` | `boolean` | `true` | Use public node resolver |
| `encoding` | `RpcEncoding` | `'Borsh'` | Wire encoding format |
| `autoConnect` | `boolean` | `true` | Auto-init WASM and connect on install |
| `devtools` | `boolean` | `true` in dev | Enable Vue DevTools integration |
| `panicHook` | `'console' \| 'browser' \| false` | `'console'` | WASM panic handler |

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

`'Borsh'` is the default and recommended encoding for performance. `'SerdeJson'` produces human-readable JSON and is useful for debugging.

---

## WasmStatus

```ts
type WasmStatus = 'idle' | 'loading' | 'ready' | 'error'
```

| Value | Meaning |
|---|---|
| `'idle'` | WASM not started |
| `'loading'` | WASM module is being fetched and compiled |
| `'ready'` | WASM initialized |
| `'error'` | Initialization failed |

---

## RpcConnectionState

```ts
type RpcConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
```

| Value | Meaning |
|---|---|
| `'disconnected'` | No connection |
| `'connecting'` | WebSocket opening |
| `'connected'` | Active connection |
| `'reconnecting'` | Attempting to reconnect after drop |
| `'error'` | Connection failed after max retries |

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

Subset of `KaspaPluginOptions` — passed to `useRpc().connect(options?)` to override plugin defaults for a single connection.

---

## ServerInfo

Returned by `useRpc().getInfo()`.

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

Returned by `useRpc().getBlock(hash)`.

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

A single UTXO output. Compatible with `@vue-kaspa/kaspa-wasm`'s `IUtxoEntry` — safe to pass directly to `createTransactions()`.

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

| Field | Description |
|---|---|
| `address` | Owner address (may be undefined for script outputs) |
| `outpoint` | Transaction ID + output index that uniquely identifies this UTXO |
| `amount` | Value in sompi |
| `scriptPublicKey` | Locking script |
| `blockDaaScore` | DAA score of the block that included this output |
| `isCoinbase` | `true` for mining rewards (maturity delay applies) |

---

## UtxoBalance

Reactive balance computed by `useUtxo()` from tracked UTXO entries.

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

Returned by `useRpc().getBalanceByAddress()` and `getBalancesByAddresses()`.

```ts
interface BalanceResult {
  address: string
  balance: bigint  // in sompi
}
```

---

## FeeEstimate

Returned by `useRpc().getFeeEstimate()`. Provides fee rate buckets at different priority levels.

```ts
interface FeeEstimate {
  priorityBucket: { feerate: number; estimatedSeconds: number }
  normalBuckets:  Array<{ feerate: number; estimatedSeconds: number }>
  lowBuckets:     Array<{ feerate: number; estimatedSeconds: number }>
}
```

`feerate` is in sompi per gram of transaction mass. Use with `useTransaction()`'s `feeRate` setting.

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
