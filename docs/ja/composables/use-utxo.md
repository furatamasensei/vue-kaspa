# useUtxo

1 つ以上のアドレスの UTXO をリアルタイムで追跡します。ノードの UTXO 変更通知ストリームを購読し、リアクティブな残高を自動的に計算します。

## インポート

```ts
import { useUtxo } from 'vue-kaspa'
```

## 戻り値の型

```ts
interface UseUtxoReturn {
  entries: Readonly<Ref<UtxoEntry[]>>
  balance: ComputedRef<UtxoBalance>
  trackedAddresses: Readonly<Ref<string[]>>
  isTracking: ComputedRef<boolean>
  track(addresses: string[]): Promise<void>
  untrack(addresses: string[]): Promise<void>
  refresh(): Promise<void>
  clear(): Promise<void>
}
```

## プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `entries` | `Readonly<Ref<UtxoEntry[]>>` | 追跡中のアドレスのすべての UTXO エントリ |
| `balance` | `ComputedRef<UtxoBalance>` | `entries` から導出されるリアクティブな残高 |
| `trackedAddresses` | `Readonly<Ref<string[]>>` | 現在追跡中のアドレス |
| `isTracking` | `ComputedRef<boolean>` | 少なくとも 1 つのアドレスが追跡中の場合 `true` |

## メソッド

| メソッド | 説明 |
|---|---|
| `track(addresses[])` | 指定したアドレスの UTXO 変更を購読し、現在の UTXO をフェッチする |
| `untrack(addresses[])` | 指定したアドレスの購読を解除し UTXO を削除する |
| `refresh()` | 現在追跡中のすべてのアドレスの UTXO を再フェッチする |
| `clear()` | すべてのアドレスの購読を解除し、すべての UTXO エントリをクリアする |

## 残高フィールド

```ts
interface UtxoBalance {
  mature: bigint    // Confirmed, spendable (non-coinbase UTXOs)
  pending: bigint   // Coinbase UTXOs with maturity delay, or unconfirmed incoming
  outgoing: bigint  // Always 0n (reserved for future in-flight tracking)
}
```

- **`mature`** — 使用可能です。これらのエントリを `useTransaction()` に渡してください。
- **`pending`** — まだ満期に達していないマイニング報酬、または未確認の受信。すぐに使用することはできません。
- **`outgoing`** — 現在は常に `0n` です。

## 基本的な使い方

```vue
<script setup lang="ts">
import { useUtxo, useCrypto } from 'vue-kaspa'

const utxo = useUtxo()
const crypto = useCrypto()

await utxo.track(['kaspa:qr...'])
</script>

<template>
  <div v-if="utxo.isTracking.value">
    <p>
      Balance: {{ crypto.sompiToKaspaString(utxo.balance.value.mature) }} KAS
    </p>
    <p v-if="utxo.balance.value.pending > 0n">
      Pending: {{ crypto.sompiToKaspaString(utxo.balance.value.pending) }} KAS
    </p>
    <p>UTXOs: {{ utxo.entries.value.length }}</p>
  </div>
</template>
```

## 複数アドレスの追跡

HD ウォレットのすべてのアドレスを一度に追跡する:

```ts
const crypto = useCrypto()
const utxo = useUtxo()

const { receive, change } = crypto.derivePublicKeys(phrase, 'mainnet', 20, 20)
const allAddresses = [
  ...receive.map(k => k.address),
  ...change.map(k => k.address),
]

await utxo.track(allAddresses)
// utxo.balance.value now reflects the combined balance across all addresses
```

## useTransaction との連携

`utxo.entries.value` は `CreateTransactionSettings.entries` と互換性があります — そのまま渡せます:

```ts
const utxo = useUtxo()
const tx = useTransaction()

await utxo.track(['kaspa:qr...'])

const txIds = await tx.send({
  entries: utxo.entries.value,  // pass directly
  outputs: [{ address: 'kaspa:qdest...', amount: 1_000_000_000n }],
  changeAddress: 'kaspa:qr...',
  priorityFee: 1000n,
  networkId: 'mainnet',
  privateKeys: ['your-private-key-hex'],
})
```

## 部分的な追跡解除

```ts
// Track three addresses
await utxo.track(['kaspa:qa...', 'kaspa:qb...', 'kaspa:qc...'])

// Later, stop tracking one of them
await utxo.untrack(['kaspa:qb...'])
// utxo.entries.value no longer contains UTXOs for kaspa:qb...
```

## 手動リフレッシュ

```ts
// Re-fetch all UTXOs for tracked addresses (useful after a confirmed transaction)
await utxo.refresh()
```

## 自動クリーンアップ

`useUtxo()` が Vue コンポーネント内で呼び出された場合、`onUnmounted` 時に `clear()` が自動的に呼ばれます。これにより、すべてのアドレスの購読が解除され、ノード側のサブスクリプションが解放されます。

```vue
<script setup lang="ts">
// This component's UTXO tracking is automatically cleaned up when the component unmounts
const utxo = useUtxo()
await utxo.track(['kaspa:qr...'])
</script>
```

::: warning Pinia ストア
コンポーネント外 (例: Pinia ストアや通常のコンポーザブル内) で `useUtxo()` を呼び出した場合、自動クリーンアップは適用されません。適切なタイミングで手動で `utxo.clear()` を呼び出してください。
:::

## 個々の UTXO エントリ

```ts
utxo.entries.value.forEach(entry => {
  console.log({
    address:      entry.address,
    amount:       entry.amount,       // bigint in sompi
    isCoinbase:   entry.isCoinbase,   // true for mining rewards
    txId:         entry.outpoint.transactionId,
    outputIndex:  entry.outpoint.index,
    daaScore:     entry.blockDaaScore,
  })
})
```
