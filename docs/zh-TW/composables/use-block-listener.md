# useBlockListener

即時監聽新增到 Kaspa DAG 的區塊。它包裝 `block-added` 訂閱，並將每個事件轉成 [`BlockInfo`](/zh-TW/reference/types#blockinfo) 型別。

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

## 基本用法

```ts
import { useBlockListener } from 'vue-kaspa'

const { blocks, isListening } = useBlockListener()
```

預設 `autoSubscribe: true`。元件掛載時會自動訂閱，卸載時會自動取消。

## 手動控制

```ts
const { blocks, isListening, subscribe, unsubscribe, clear } = useBlockListener({
  autoSubscribe: false,
  maxHistory: 50,
})
```

## 注意事項

- 內部使用 `block-added`。
- 若你需要已確認交易，請改用 [`useTransactionListener()`](/zh-TW/composables/use-transaction-listener)。
- `maxHistory` 可以限制保留數量。
