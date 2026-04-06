# useTransactionListener

Reactively listens for accepted transaction IDs on the Kaspa network. Uses the `virtual-chain-changed` subscription with `includeAcceptedTxIds: true` to capture transactions as they are confirmed.

## Import

```ts
import { useTransactionListener } from 'vue-kaspa'
```

## Return type

```ts
interface UseTransactionListenerReturn {
  transactions: Readonly<Ref<string[]>>
  acceptedTransactions: Readonly<Ref<Array<{
    transactionId: string
    acceptingBlockHash: string
    senderAddresses: string[]
  }>>>
  isListening: ComputedRef<boolean>
  subscribe(): Promise<void>
  unsubscribe(): Promise<void>
  clear(): void
  resolveSenderAddresses(transactionId: string): Promise<string[]>
}
```

## Options

```ts
interface TransactionListenerOptions {
  maxHistory?: number     // Max transaction IDs to keep. Default: 100
  autoSubscribe?: boolean // Subscribe on mount. Default: true
  includeSenderAddresses?: boolean // Resolve input addresses from the accepting block. Default: false
}
```

## Basic usage

```ts
import { useTransactionListener } from 'vue-kaspa'

const { transactions, acceptedTransactions, isListening } = useTransactionListener()

// transactions.value — string[], accepted tx IDs, most recent first
// acceptedTransactions.value — enriched records with senderAddresses
// If includeSenderAddresses is false, call resolveSenderAddresses(txId) on demand
```

With `autoSubscribe: true` (the default), the composable subscribes when the component mounts and unsubscribes when it unmounts. If the RPC client isn't connected yet, it waits for the `connect` event before subscribing.

## Manual control

```ts
const { transactions, acceptedTransactions, isListening, subscribe, unsubscribe, clear, resolveSenderAddresses } = useTransactionListener({
  autoSubscribe: false,
  maxHistory: 200,
  includeSenderAddresses: true,
})

await subscribe()
await resolveSenderAddresses(transactions.value[0])
await unsubscribe()
clear()
```

## Template example

```vue
<script setup lang="ts">
import { useTransactionListener } from 'vue-kaspa'

const { transactions, acceptedTransactions, isListening, subscribe, unsubscribe } = useTransactionListener({
  includeSenderAddresses: true,
})
</script>

<template>
  <div>
    <p>Status: {{ isListening ? 'Listening' : 'Stopped' }}</p>
    <button @click="isListening ? unsubscribe() : subscribe()">
      {{ isListening ? 'Stop' : 'Start' }}
    </button>

    <ul>
      <li v-for="txId in transactions" :key="txId">{{ txId }}</li>
    </ul>

    <ul>
      <li v-for="tx in acceptedTransactions" :key="tx.transactionId">
        {{ tx.transactionId }} - {{ tx.senderAddresses.join(', ') || 'resolving...' }}
      </li>
    </ul>
  </div>
</template>
```

## Notes

- Uses `virtual-chain-changed` (not `block-added`) — this captures transactions that have been **accepted** into the virtual chain, which is the authoritative confirmed state.
- A single `virtual-chain-changed` event can carry many accepted transaction IDs across multiple blocks; all are prepended to `transactions.value`.
- `acceptedTransactions.value` keeps the accepting block hash and, when enabled, the sender addresses derived from the block's full transactions.
- Call `resolveSenderAddresses(transactionId)` to populate sender addresses on demand for a tracked transaction.
- `senderAddresses` is derived from the accepted transaction inputs, so a transaction may report more than one sender address.
- `maxHistory` bounds memory — oldest entries are dropped once the limit is reached.
- For raw block events (hash, blue score, tx list), use [`useBlockListener`](/composables/use-block-listener) instead.

## Hash helpers

`acceptedTransactions.value` includes both transaction IDs and their accepting block hashes. Use `formatHash(hash, 'transaction')` or `formatHash(hash, 'block')` to render each string with an explicit label, optional truncation, and a consistent suffix/prefix so UIs can visually differentiate the two hash types.
