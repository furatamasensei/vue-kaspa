# useTransactionListener

Mendengarkan transaction ID yang sudah accepted di jaringan Kaspa secara reaktif. Composable ini memakai subscription `virtual-chain-changed` untuk menangkap transaksi saat terkonfirmasi.

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

## Pemakaian dasar

```ts
import { useTransactionListener } from 'vue-kaspa'

const { transactions, acceptedTransactions, isListening } = useTransactionListener()
```

Kalau `includeSenderAddresses` diaktifkan, alamat pengirim akan diresolusikan dari block yang menerima transaksi tersebut.

## Kontrol manual

```ts
const { transactions, acceptedTransactions, isListening, subscribe, unsubscribe, clear, resolveSenderAddresses } = useTransactionListener({
  autoSubscribe: false,
  includeSenderAddresses: true,
})
```

## Catatan

- Menggunakan `virtual-chain-changed`, jadi hanya event transaksi yang accepted yang diproses.
- Satu transaksi bisa punya lebih dari satu sender address.
- Untuk event block mentah, gunakan [`useBlockListener()`](/id/composables/use-block-listener).
