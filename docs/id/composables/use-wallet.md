# useWallet

Wrapper bertipe untuk extension wallet browser Kaspa: KasWare dan Kastle. Menyediakan state koneksi reaktif dan API tunggal untuk connect, disconnect, kirim KAS, dan tanda tangan pesan.

::: warning Web only
`useWallet` bergantung pada `window.kasware` / `window.kastle`, jadi **hanya untuk browser**.
:::

::: tip No WASM required
Komposabel ini langsung bicara ke extension browser, jadi tidak perlu memanggil `useKaspa().init()` dulu.
:::

## Import

```ts
import { useWallet } from 'vue-kaspa'
```

## Tipe return

```ts
interface UseWalletReturn {
  provider: Readonly<Ref<WalletProvider | null>>
  address: Readonly<Ref<string | null>>
  publicKey: Readonly<Ref<string | null>>
  balance: Readonly<Ref<WalletBalance | null>>
  network: Readonly<Ref<string | null>>
  isConnecting: Readonly<Ref<boolean>>
  isConnected: ComputedRef<boolean>
  isKaswareInstalled: ComputedRef<boolean>
  isKastleInstalled: ComputedRef<boolean>
  error: Readonly<Ref<Error | null>>
  connect(provider: WalletProvider, network?: string): Promise<void>
  disconnect(): Promise<void>
  sendKaspa(to: string, amount: bigint, options?: WalletSendOptions): Promise<string>
  signMessage(message: string, options?: { type?: 'schnorr' | 'ecdsa' }): Promise<string>
}
```

## Pemakaian dasar

```ts
import { useWallet } from 'vue-kaspa'

const wallet = useWallet()
```

## Method utama

- `connect(provider, network?)`
- `disconnect()`
- `sendKaspa(to, amount, options?)`
- `signMessage(message, options?)`

## Catatan

- `sendKaspa` dan `signMessage` terutama untuk KasWare.
- `useWallet()` memakai shared state di level modul.
- Kastle perlu build transaksi sendiri jika ingin mengirim KAS.
