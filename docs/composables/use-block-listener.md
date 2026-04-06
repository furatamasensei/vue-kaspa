# useBlockListener

Reactively listens for new blocks added to the Kaspa DAG. Wraps the `block-added` subscription and maps each event to the [`BlockInfo`](/reference/types#blockinfo) type.

## Import

```ts
import { useBlockListener } from 'vue-kaspa'
```

## Return type

```ts
interface UseBlockListenerReturn {
  blocks: Readonly<Ref<BlockInfo[]>>
  isListening: ComputedRef<boolean>
  subscribe(): Promise<void>
  unsubscribe(): Promise<void>
  clear(): void
}
```

## Options

```ts
interface BlockListenerOptions {
  maxHistory?: number    // Max blocks to keep in history. Default: 100
  autoSubscribe?: boolean // Subscribe on mount. Default: true
}
```

## Basic usage

```ts
import { useBlockListener } from 'vue-kaspa'

const { blocks, isListening } = useBlockListener()

// blocks.value — BlockInfo[], most recent first
// { hash, timestamp, blueScore, transactions: string[] }
```

With `autoSubscribe: true` (the default), the composable automatically subscribes when the component mounts and unsubscribes when it unmounts. If the RPC client isn't connected yet, it waits for the `connect` event before subscribing.

## Manual control

Disable auto-subscribe to control the lifecycle yourself:

```ts
const { blocks, isListening, subscribe, unsubscribe, clear } = useBlockListener({
  autoSubscribe: false,
  maxHistory: 50,
})

// Subscribe manually
await subscribe()

// Stop and unsubscribe
await unsubscribe()

// Clear accumulated history
clear()
```

## Template example

```vue
<script setup lang="ts">
import { useBlockListener } from 'vue-kaspa'

const { blocks, isListening, subscribe, unsubscribe } = useBlockListener()
</script>

<template>
  <div>
    <p>Status: {{ isListening ? 'Listening' : 'Stopped' }}</p>
    <button @click="isListening ? unsubscribe() : subscribe()">
      {{ isListening ? 'Stop' : 'Start' }}
    </button>

    <ul>
      <li v-for="block in blocks" :key="block.hash">
        {{ block.hash }} — blue score {{ block.blueScore }} — {{ block.transactions.length }} txs
      </li>
    </ul>
  </div>
</template>
```

## BlockInfo

```ts
interface BlockInfo {
  hash: string         // Block hash
  timestamp: number    // Unix timestamp (ms)
  blueScore: bigint    // DAG blue score
  transactions: string[] // Transaction IDs in this block
}
```

## Notes

- Uses the `block-added` subscription internally. Blocks appear as they are propagated to the node, before DAG finalization.
- For confirmed (accepted) transactions, use [`useTransactionListener`](/composables/use-transaction-listener) instead, which uses `virtual-chain-changed`.
- `maxHistory` bounds memory — old entries are dropped from the tail once the limit is reached.
