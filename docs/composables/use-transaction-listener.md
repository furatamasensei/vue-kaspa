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
  isListening: ComputedRef<boolean>
  subscribe(): Promise<void>
  unsubscribe(): Promise<void>
  clear(): void
}
```

## Options

```ts
interface TransactionListenerOptions {
  maxHistory?: number     // Max transaction IDs to keep. Default: 100
  autoSubscribe?: boolean // Subscribe on mount. Default: true
}
```

## Basic usage

```ts
import { useTransactionListener } from 'vue-kaspa'

const { transactions, isListening } = useTransactionListener()

// transactions.value — string[], accepted tx IDs, most recent first
```

With `autoSubscribe: true` (the default), the composable subscribes when the component mounts and unsubscribes when it unmounts. If the RPC client isn't connected yet, it waits for the `connect` event before subscribing.

## Manual control

```ts
const { transactions, isListening, subscribe, unsubscribe, clear } = useTransactionListener({
  autoSubscribe: false,
  maxHistory: 200,
})

await subscribe()
await unsubscribe()
clear()
```

## Template example

```vue
<script setup lang="ts">
import { useTransactionListener } from 'vue-kaspa'

const { transactions, isListening, subscribe, unsubscribe } = useTransactionListener()
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
  </div>
</template>
```

## Notes

- Uses `virtual-chain-changed` (not `block-added`) — this captures transactions that have been **accepted** into the virtual chain, which is the authoritative confirmed state.
- A single `virtual-chain-changed` event can carry many accepted transaction IDs across multiple blocks; all are prepended to `transactions.value`.
- `maxHistory` bounds memory — oldest entries are dropped once the limit is reached.
- For raw block events (hash, blue score, tx list), use [`useBlockListener`](/composables/use-block-listener) instead.
