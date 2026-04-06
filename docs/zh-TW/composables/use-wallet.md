# useWallet

提供 KasWare 與 Kastle Kaspa 瀏覽器錢包擴充套件的型別化包裝。可用單一 API 管理連線狀態、送出 KAS 與簽署訊息。

::: warning Web only
`useWallet` 依賴 `window.kasware` / `window.kastle`，**僅支援瀏覽器**。
:::

::: tip No WASM required
它直接和瀏覽器擴充套件溝通，因此不需要先呼叫 `useKaspa().init()`。
:::

## Import

```ts
import { useWallet } from 'vue-kaspa'
```

## Return type

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

## 基本用法

```ts
import { useWallet } from 'vue-kaspa'

const wallet = useWallet()
```

## 主要方法

- `connect(provider, network?)`
- `disconnect()`
- `sendKaspa(to, amount, options?)`
- `signMessage(message, options?)`

## 注意事項

- `sendKaspa` 與 `signMessage` 主要支援 KasWare。
- `useWallet()` 使用模組層級的共享 state。
- Kastle 要送幣時需要自建交易並直接呼叫擴充套件 API。
