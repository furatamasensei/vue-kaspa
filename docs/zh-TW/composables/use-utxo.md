# useUtxo

即時追蹤一個或多個地址的 UTXO。訂閱節點的 UTXO 變更通知串流，並自動計算響應式餘額。

## 匯入

```ts
import { useUtxo } from 'vue-kaspa'
```

## 回傳型別

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

## 屬性

| 屬性 | 型別 | 說明 |
|---|---|---|
| `entries` | `Readonly<Ref<UtxoEntry[]>>` | 已追蹤地址的所有原始 UTXO 項目 |
| `balance` | `ComputedRef<UtxoBalance>` | 從 `entries` 衍生的響應式餘額 |
| `trackedAddresses` | `Readonly<Ref<string[]>>` | 目前正在追蹤的地址 |
| `isTracking` | `ComputedRef<boolean>` | 至少有一個地址被追蹤時為 `true` |

## 方法

| 方法 | 說明 |
|---|---|
| `track(addresses[])` | 訂閱 UTXO 變更並擷取指定地址的目前 UTXO |
| `untrack(addresses[])` | 取消訂閱並移除指定地址的 UTXO |
| `refresh()` | 重新擷取所有目前已追蹤地址的 UTXO |
| `clear()` | 取消訂閱所有地址並清除所有 UTXO 項目 |

## 餘額欄位

```ts
interface UtxoBalance {
  mature: bigint    // Confirmed, spendable (non-coinbase UTXOs)
  pending: bigint   // Coinbase UTXOs with maturity delay, or unconfirmed incoming
  outgoing: bigint  // Always 0n (reserved for future in-flight tracking)
}
```

- **`mature`** — 可安全使用。將這些項目傳給 `useTransaction()`。
- **`pending`** — 尚未達到成熟度的挖礦獎勵。無法立即使用。
- **`outgoing`** — 目前永遠為 `0n`。

## 基本用法

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

## 追蹤多個地址

一次追蹤 HD 錢包中的所有地址：

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

## 與 useTransaction 搭配使用

`utxo.entries.value` 與 `CreateTransactionSettings.entries` 相容——可直接傳入：

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

## 部分取消追蹤

```ts
// Track three addresses
await utxo.track(['kaspa:qa...', 'kaspa:qb...', 'kaspa:qc...'])

// Later, stop tracking one of them
await utxo.untrack(['kaspa:qb...'])
// utxo.entries.value no longer contains UTXOs for kaspa:qb...
```

## 手動刷新

```ts
// Re-fetch all UTXOs for tracked addresses (useful after a confirmed transaction)
await utxo.refresh()
```

## 自動清理

當 `useUtxo()` 在 Vue 元件內呼叫時，`clear()` 會在 `onUnmounted` 時自動呼叫。這會取消訂閱所有地址並釋放節點端的訂閱。

```vue
<script setup lang="ts">
// This component's UTXO tracking is automatically cleaned up when the component unmounts
const utxo = useUtxo()
await utxo.track(['kaspa:qr...'])
</script>
```

::: warning Pinia 儲存庫
如果在元件外部呼叫 `useUtxo()`（例如在 Pinia 儲存庫或純組合函式中），自動清理不適用。請在適當時機手動呼叫 `utxo.clear()`。
:::

## 個別 UTXO 項目

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
