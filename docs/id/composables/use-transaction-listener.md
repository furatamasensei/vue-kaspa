# useTransactionListener

Mendengarkan transaction ID yang sudah accepted di jaringan Kaspa secara reaktif. Komposabel ini memakai subscription `virtual-chain-changed` untuk menangkap transaksi saat terkonfirmasi.

## Impor

```ts
import { useTransactionListener } from 'vue-kaspa'
```

## Tipe return

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

## Opsi

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

## Pembantu hash

`acceptedTransactions.value` menyimpan ID transaksi dan block hash penerima. Gunakan `formatHash(hash, 'transaction')` atau `formatHash(hash, 'block')` agar setiap string menampilkan label eksplisit, pemendekan default, dan suffix/prefix konsisten sehingga mudah membedakan antara hash transaksi dan hash block di UI.
