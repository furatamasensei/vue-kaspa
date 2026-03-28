# useUtxo

Tracks UTXOs for one or more addresses in real time. Subscribes to the node's UTXO change notification stream and computes a reactive balance automatically.

## Import

```ts
import { useUtxo } from 'vue-kaspa'
```

## Return type

```ts
interface UseUtxoReturn {
  entries: Readonly<Ref<UtxoEntry[]>>
  balance: ComputedRef<UtxoBalance>
  trackedAddresses: Readonly<Ref<string[]>>
  isTracking: ComputedRef<boolean>
  track(addresses: string[]): Promise<void>
  untrack(addresses: string[]): Promise<void>
  refresh(): Promise<void>
  clear(): Promise<void>
}
```

## Properties

| Property | Type | Description |
|---|---|---|
| `entries` | `Readonly<Ref<UtxoEntry[]>>` | All raw UTXO entries for tracked addresses |
| `balance` | `ComputedRef<UtxoBalance>` | Reactive balance derived from `entries` |
| `trackedAddresses` | `Readonly<Ref<string[]>>` | Addresses currently being tracked |
| `isTracking` | `ComputedRef<boolean>` | `true` when at least one address is tracked |

## Methods

| Method | Description |
|---|---|
| `track(addresses[])` | Subscribe to UTXO changes and fetch current UTXOs for the given addresses |
| `untrack(addresses[])` | Unsubscribe and remove UTXOs for the given addresses |
| `refresh()` | Re-fetch UTXOs for all currently tracked addresses |
| `clear()` | Unsubscribe from all addresses and clear all UTXO entries |

## Balance fields

```ts
interface UtxoBalance {
  mature: bigint    // Confirmed, spendable (non-coinbase UTXOs)
  pending: bigint   // Coinbase UTXOs with maturity delay, or unconfirmed incoming
  outgoing: bigint  // Always 0n (reserved for future in-flight tracking)
}
```

- **`mature`** — safe to spend. Pass these entries to `useTransaction()`.
- **`pending`** — mining rewards that haven't reached maturity yet. Cannot be spent immediately.
- **`outgoing`** — currently always `0n`.

## Basic usage

```vue
<script setup lang="ts">
import { useUtxo, useCrypto } from 'vue-kaspa'

const utxo = useUtxo()
const crypto = useCrypto()

await utxo.track(['kaspa:qr...'])
</script>

<template>
  <div v-if="utxo.isTracking.value">
    <p>
      Balance: {{ crypto.sompiToKaspaString(utxo.balance.value.mature) }} KAS
    </p>
    <p v-if="utxo.balance.value.pending > 0n">
      Pending: {{ crypto.sompiToKaspaString(utxo.balance.value.pending) }} KAS
    </p>
    <p>UTXOs: {{ utxo.entries.value.length }}</p>
  </div>
</template>
```

## Tracking multiple addresses

Track all addresses from an HD wallet in one call:

```ts
const crypto = useCrypto()
const utxo = useUtxo()

const { receive, change } = crypto.derivePublicKeys(phrase, 'mainnet', 20, 20)
const allAddresses = [
  ...receive.map(k => k.address),
  ...change.map(k => k.address),
]

await utxo.track(allAddresses)
// utxo.balance.value now reflects the combined balance across all addresses
```

## Using entries with useTransaction

`utxo.entries.value` is compatible with `CreateTransactionSettings.entries` — pass it directly:

```ts
const utxo = useUtxo()
const tx = useTransaction()

await utxo.track(['kaspa:qr...'])

const txIds = await tx.send({
  entries: utxo.entries.value,  // pass directly
  outputs: [{ address: 'kaspa:qdest...', amount: 1_000_000_000n }],
  changeAddress: 'kaspa:qr...',
  priorityFee: 1000n,
  networkId: 'mainnet',
  privateKeys: ['your-private-key-hex'],
})
```

## Partial untracking

```ts
// Track three addresses
await utxo.track(['kaspa:qa...', 'kaspa:qb...', 'kaspa:qc...'])

// Later, stop tracking one of them
await utxo.untrack(['kaspa:qb...'])
// utxo.entries.value no longer contains UTXOs for kaspa:qb...
```

## Manual refresh

```ts
// Re-fetch all UTXOs for tracked addresses (useful after a confirmed transaction)
await utxo.refresh()
```

## Auto-cleanup

When `useUtxo()` is called inside a Vue component, `clear()` is automatically called on `onUnmounted`. This unsubscribes all addresses and releases the node-side subscription.

```vue
<script setup lang="ts">
// This component's UTXO tracking is automatically cleaned up when the component unmounts
const utxo = useUtxo()
await utxo.track(['kaspa:qr...'])
</script>
```

::: warning Pinia stores
If you call `useUtxo()` outside a component (e.g., in a Pinia store or a plain composable), auto-cleanup does not apply. Call `utxo.clear()` manually when appropriate.
:::

## Individual UTXO entries

```ts
utxo.entries.value.forEach(entry => {
  console.log({
    address:      entry.address,
    amount:       entry.amount,       // bigint in sompi
    isCoinbase:   entry.isCoinbase,   // true for mining rewards
    txId:         entry.outpoint.transactionId,
    outputIndex:  entry.outpoint.index,
    daaScore:     entry.blockDaaScore,
  })
})
```
