# useWallet

Connects your app to third-party Kaspa browser wallet extensions — **KasWare** and **Kastle**. Exposes reactive connection state and a unified API for connecting, disconnecting, sending KAS, and signing messages.

::: warning Web only
`useWallet` relies on browser extension APIs (`window.kasware` / `window.kastle`) and is only supported in **web browsers**. Mobile apps are not supported.
:::

::: tip No WASM required
`useWallet` talks directly to the browser extension via `window.kasware` / `window.kastle`. You do not need to call `useKaspa().init()` first.
:::

## Import

```ts
import { useWallet } from 'vue-kaspa'
```

## Return type

```ts
interface UseWalletReturn {
  provider:             Readonly<Ref<WalletProvider | null>>
  address:              Readonly<Ref<string | null>>
  publicKey:            Readonly<Ref<string | null>>
  balance:              Readonly<Ref<WalletBalance | null>>
  network:              Readonly<Ref<string | null>>
  isConnecting:         Readonly<Ref<boolean>>
  isConnected:          ComputedRef<boolean>
  isKaswareInstalled:   ComputedRef<boolean>
  isKastleInstalled:    ComputedRef<boolean>
  error:                Readonly<Ref<Error | null>>
  connect(provider: WalletProvider, network?: string): Promise<void>
  disconnect(): Promise<void>
  sendKaspa(to: string, amount: bigint, options?: WalletSendOptions): Promise<string>
  signMessage(message: string, options?: { type?: 'schnorr' | 'ecdsa' }): Promise<string>
}
```

## Properties

| Property | Type | Description |
|---|---|---|
| `provider` | `Readonly<Ref<WalletProvider \| null>>` | `'kasware'` or `'kastle'` when connected, `null` otherwise |
| `address` | `Readonly<Ref<string \| null>>` | Connected account address |
| `publicKey` | `Readonly<Ref<string \| null>>` | Connected account public key |
| `balance` | `Readonly<Ref<WalletBalance \| null>>` | KAS balance in sompi — populated for KasWare only, `null` for Kastle |
| `network` | `Readonly<Ref<string \| null>>` | Active network (`'mainnet'`, `'testnet-10'`, etc.) |
| `isConnecting` | `Readonly<Ref<boolean>>` | `true` while a `connect()` call is in progress |
| `isConnected` | `ComputedRef<boolean>` | `true` when `provider` and `address` are both set |
| `isKaswareInstalled` | `ComputedRef<boolean>` | `true` when `window.kasware` is present |
| `isKastleInstalled` | `ComputedRef<boolean>` | `true` when `window.kastle` is present |
| `error` | `Readonly<Ref<Error \| null>>` | Last connection error, cleared on the next `connect()` call |

## Methods

| Method | Description |
|---|---|
| `connect(provider, network?)` | Connect to a wallet. `network` is only used by Kastle (default `'mainnet'`). |
| `disconnect()` | Disconnect the active wallet and clear all state. |
| `sendKaspa(to, amount, options?)` | Send KAS via the active wallet. **KasWare only** — throws for Kastle. |
| `signMessage(message, options?)` | Sign a message. **KasWare only** — throws for Kastle. |

## Basic usage

```vue
<script setup lang="ts">
import { useWallet } from 'vue-kaspa'

const wallet = useWallet()
</script>

<template>
  <div v-if="!wallet.isConnected.value">
    <button
      v-if="wallet.isKaswareInstalled.value"
      :disabled="wallet.isConnecting.value"
      @click="wallet.connect('kasware')"
    >
      Connect KasWare
    </button>
    <button
      v-if="wallet.isKastleInstalled.value"
      @click="wallet.connect('kastle')"
    >
      Connect Kastle
    </button>
  </div>

  <div v-else>
    <p>Address: {{ wallet.address.value }}</p>
    <p>Network: {{ wallet.network.value }}</p>
    <button @click="wallet.disconnect()">Disconnect</button>
  </div>
</template>
```

## Connecting to KasWare

KasWare prompts the user to approve the connection. `connect()` will throw if the user rejects.

```ts
const wallet = useWallet()

try {
  await wallet.connect('kasware')
  console.log('Connected:', wallet.address.value)
  console.log('Balance (sompi):', wallet.balance.value?.total)
} catch (err) {
  console.error('Rejected or not installed:', err)
}
```

## Connecting to Kastle

Kastle requires a target network. Pass it as the second argument:

```ts
const wallet = useWallet()

await wallet.connect('kastle', 'mainnet')
// or for testnet:
await wallet.connect('kastle', 'testnet-10')

console.log('Address:', wallet.address.value)
```

## Sending KAS (KasWare)

```ts
const wallet = useWallet()

// Amounts are always in sompi (1 KAS = 100,000,000 sompi)
const txId = await wallet.sendKaspa(
  'kaspa:qr...',
  100_000_000n, // 1 KAS
  { priorityFee: 1000n },
)
console.log('Transaction ID:', txId)
```

::: warning Kastle
`sendKaspa` is **not supported for Kastle**. Sending via Kastle requires building a full transaction and calling `window.kastle.signAndBroadcastTx(network, txJson)` directly. See the [Kastle docs](https://docs.kastle.cc/) for details.
:::

## Signing a message (KasWare)

```ts
const wallet = useWallet()

const signature = await wallet.signMessage('Hello Kaspa', { type: 'schnorr' })
console.log('Signature:', signature)
```

`type` defaults to `'schnorr'`. Pass `'ecdsa'` if needed.

## Reactive balance updates (KasWare)

When connected via KasWare, `balance` updates automatically whenever the wallet reports a change — no polling needed.

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useWallet } from 'vue-kaspa'

const wallet = useWallet()

const kasBalance = computed(() => {
  const total = wallet.balance.value?.total
  if (total === undefined) return '—'
  return (Number(total) / 1e8).toFixed(4)
})
</script>

<template>
  <p>Balance: {{ kasBalance }} KAS</p>
</template>
```

## Error handling

```ts
const wallet = useWallet()

try {
  await wallet.connect('kasware')
} catch (err) {
  // wallet.error.value is also set
  if (err instanceof KaspaWalletError) {
    console.error(err.message)
  }
}
```

See [Error Handling](/guide/error-handling) for the full error hierarchy.

## Singleton

`useWallet()` uses **module-level shared state**. All instances across your app read from and write to the same connection. Connecting in one component makes `isConnected` reactive in every other component that calls `useWallet()`.

## Supported wallets

| Wallet | Detection | Install |
|---|---|---|
| [KasWare](https://kasware.xyz) | `window.kasware` | [kasware.xyz](https://kasware.xyz) |
| [Kastle](https://kastle.cc) | `window.kastle` | [kastle.cc](https://kastle.cc) |
