# useTransactionListener

即時監聽 Kaspa 網路中已接受的交易 ID。它使用 `virtual-chain-changed` 訂閱，當交易被確認時就會捕捉到。

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
  maxHistory?: number
  autoSubscribe?: boolean
  includeSenderAddresses?: boolean
}
```

## 基本用法

```ts
import { useTransactionListener } from 'vue-kaspa'

const { transactions, acceptedTransactions, isListening } = useTransactionListener()
```

啟用 `includeSenderAddresses` 後，會從接受該交易的區塊解析送出方地址。

## 手動控制

```ts
const { transactions, acceptedTransactions, isListening, subscribe, unsubscribe, clear, resolveSenderAddresses } = useTransactionListener({
  autoSubscribe: false,
  includeSenderAddresses: true,
})
```

## 注意事項

- 使用 `virtual-chain-changed`，因此只會處理已確認狀態。
- 一筆交易可能會對應多個 sender addresses。
- 若你要的是原始區塊事件，請使用 [`useBlockListener()`](/zh-TW/composables/use-block-listener)。
