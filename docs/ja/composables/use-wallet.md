# useWallet

KasWare と Kastle に対応した、Kaspa ブラウザウォレット拡張向けのラッパーです。接続状態をリアクティブに扱い、送金とメッセージ署名を共通 API で呼び出せます。

::: warning Web only
`useWallet` は `window.kasware` / `window.kastle` を使うため、**Web ブラウザ限定**です。
:::

::: tip No WASM required
ウォレット拡張へ直接接続するため、`useKaspa().init()` は不要です。
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

## 基本的な使い方

```ts
import { useWallet } from 'vue-kaspa'

const wallet = useWallet()
```

## 主要メソッド

- `connect(provider, network?)`
- `disconnect()`
- `sendKaspa(to, amount, options?)`
- `signMessage(message, options?)`

## 注意

- `sendKaspa` と `signMessage` は KasWare 向けです。
- Kastle は接続と署名までは共通ですが、送金は独自のトランザクション構築が必要です。
- `useWallet()` はモジュールレベルの共有 state を使います。
