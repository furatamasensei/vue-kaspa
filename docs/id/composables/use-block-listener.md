# useBlockListener

Mendengarkan blok baru yang ditambahkan ke DAG Kaspa secara reaktif. Komposabel ini membungkus subscription `block-added` dan mengubah setiap event menjadi tipe [`BlockInfo`](/id/reference/types#blockinfo).

## Impor

```ts
import { useBlockListener } from 'vue-kaspa'
```

## Tipe return

```ts
interface UseBlockListenerReturn {
  blocks: Readonly<Ref<BlockInfo[]>>
  isListening: ComputedRef<boolean>
  subscribe(): Promise<void>
  unsubscribe(): Promise<void>
  clear(): void
}
```

## Opsi

```ts
interface BlockListenerOptions {
  maxHistory?: number
  autoSubscribe?: boolean
}
```

## Pemakaian dasar

```ts
import { useBlockListener } from 'vue-kaspa'

const { blocks, isListening } = useBlockListener()
```

`autoSubscribe: true` adalah default. Komposabel akan subscribe saat komponen mount dan unsubscribe saat unmount.

## Kontrol manual

```ts
const { blocks, isListening, subscribe, unsubscribe, clear } = useBlockListener({
  autoSubscribe: false,
  maxHistory: 50,
})
```

## Catatan

- Menggunakan `block-added` di dalam.
- Jika kamu butuh transaksi yang sudah accepted, pakai [`useTransactionListener()`](/id/composables/use-transaction-listener).
- `maxHistory` membatasi jumlah data yang disimpan.
