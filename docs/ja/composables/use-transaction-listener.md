# useTransactionListener

Kaspa ネットワークで確定されたトランザクション ID をリアクティブに監視します。`virtual-chain-changed` サブスクリプションを使い、確定時にトランザクションを受け取ります。

## インポート

```ts
import { useTransactionListener } from 'vue-kaspa'
```

## 戻り値の型

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

## オプション

```ts
interface TransactionListenerOptions {
  maxHistory?: number
  autoSubscribe?: boolean
  includeSenderAddresses?: boolean
}
```

## 基本的な使い方

```ts
import { useTransactionListener } from 'vue-kaspa'

const { transactions, acceptedTransactions, isListening } = useTransactionListener()
```

`includeSenderAddresses` を有効にすると、承認ブロックから送信元アドレスも解決します。

## 手動制御

```ts
const { transactions, acceptedTransactions, isListening, subscribe, unsubscribe, clear, resolveSenderAddresses } = useTransactionListener({
  autoSubscribe: false,
  includeSenderAddresses: true,
})
```

## 注意

- `virtual-chain-changed` を使うため、確定状態のイベントだけを扱います。
- 送信元アドレスは入力から導出されるため、1件の取引に複数のアドレスが含まれる場合があります。
- 生のブロックイベントが必要なら [`useBlockListener()`](/ja/composables/use-block-listener) を使ってください。

## ハッシュヘルパー

`acceptedTransactions.value` には取引 ID とそれを受け入れたブロックのハッシュが含まれます。`formatHash(hash, 'transaction')` や `formatHash(hash, 'block')` を使うと、ラベル付きの文字列（デフォルトではトランケートされ、明示的な suffix/prefix が付きます）を得られるため、UI 上でブロックハッシュとトランザクションハッシュを簡単に見分けられます。
