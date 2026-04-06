# useBlockListener

Kaspa DAG に追加された新しいブロックをリアクティブに監視します。`block-added` サブスクリプションを包み、各イベントを [`BlockInfo`](/ja/reference/types#blockinfo) 型に変換します。

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
  maxHistory?: number
  autoSubscribe?: boolean
}
```

## 基本的な使い方

```ts
import { useBlockListener } from 'vue-kaspa'

const { blocks, isListening } = useBlockListener()
```

`autoSubscribe: true` が既定値です。コンポーネントのマウント時に自動で購読し、アンマウント時に解除します。

## 手動制御

```ts
const { blocks, isListening, subscribe, unsubscribe, clear } = useBlockListener({
  autoSubscribe: false,
  maxHistory: 50,
})
```

## 注意

- `block-added` を内部で使います。
- 確定済みのトランザクションが必要な場合は [`useTransactionListener()`](/ja/composables/use-transaction-listener) を使ってください。
- `maxHistory` で保持件数を制限できます。
