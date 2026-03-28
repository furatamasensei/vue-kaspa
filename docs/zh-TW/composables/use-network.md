# useNetwork

管理目前的活躍網路。切換網路會中斷目前的 RPC 連線並自動在新網路上重新連線。

## 匯入

```ts
import { useNetwork } from 'vue-kaspa'
```

## 回傳型別

```ts
interface UseNetworkReturn {
  currentNetwork: Readonly<Ref<KaspaNetwork>>
  networkId: Readonly<Ref<string | null>>
  isMainnet: ComputedRef<boolean>
  isTestnet: ComputedRef<boolean>
  daaScore: Readonly<Ref<bigint>>
  switchNetwork(network: KaspaNetwork): Promise<void>
  availableNetworks: readonly KaspaNetwork[]
}
```

## 屬性

| 屬性 | 型別 | 說明 |
|---|---|---|
| `currentNetwork` | `Readonly<Ref<KaspaNetwork>>` | 目前選定的網路 |
| `networkId` | `Readonly<Ref<string \| null>>` | 已連線節點回傳的網路 ID 字串（例如 `'mainnet'`）。未連線時為 `null`。 |
| `isMainnet` | `ComputedRef<boolean>` | `currentNetwork === 'mainnet'` |
| `isTestnet` | `ComputedRef<boolean>` | `currentNetwork === 'testnet-10'` 或 `'testnet-11'` |
| `daaScore` | `Readonly<Ref<bigint>>` | 即時 DAA 分數——與 `useRpc().virtualDaaScore` 相同的值 |
| `availableNetworks` | `readonly KaspaNetwork[]` | 所有 5 個網路名稱（與 `AVAILABLE_NETWORKS` 常數相同） |

## 方法

| 方法 | 說明 |
|---|---|
| `switchNetwork(network)` | 切換至新網路：中斷 RPC、更新 `currentNetwork`、重新連線。 |

## 可用網路

| 網路 | 說明 |
|---|---|
| `'mainnet'` | Kaspa 生產網路 |
| `'testnet-10'` | 公共測試網路（v10 共識） |
| `'testnet-11'` | 公共測試網路（v11 共識，DAGKNIGHT） |
| `'simnet'` | 用於測試的本機模擬網路 |
| `'devnet'` | 本機開發網路 |

## 基本用法

```vue
<script setup lang="ts">
import { useNetwork } from 'vue-kaspa'

const network = useNetwork()
</script>

<template>
  <div>
    <p>Network: {{ network.currentNetwork.value }}</p>
    <p>DAA score: {{ network.daaScore.value }}</p>

    <button
      v-for="n in network.availableNetworks"
      :key="n"
      @click="network.switchNetwork(n)"
      :disabled="network.currentNetwork.value === n"
    >
      {{ n }}
    </button>
  </div>
</template>
```

## 切換網路

```ts
const network = useNetwork()

// Switch to testnet-10
await network.switchNetwork('testnet-10')
// network.currentNetwork.value === 'testnet-10'
// RPC automatically reconnected to a testnet-10 node
```

`switchNetwork()` 是非同步的——它會等待中斷與重連序列完成。

## 網路感知的加密操作

地址格式是網路特定的。呼叫 `useCrypto()` 方法時請使用 `currentNetwork.value`：

```ts
const network = useNetwork()
const crypto = useCrypto()

// Always use the active network when generating/deriving addresses
const keypair = crypto.generateKeypair(network.currentNetwork.value)
// mainnet  → 'kaspa:qr...'
// testnet  → 'kaspatest:qr...'

const { receive } = crypto.derivePublicKeys(
  phrase,
  network.currentNetwork.value,
  10,
)
```

或使用計算屬性讓地址隨網路變更而同步：

```ts
const network = useNetwork()
const crypto = useCrypto()

const exampleAddress = computed(() =>
  network.isTestnet.value
    ? 'kaspatest:qqc4gu8kzf5z9hpd8hg9qmcqv9qv8ywc79pu8n58p6mcqvyyw64qhgu3mhnzf'
    : 'kaspa:qqc4gu8kzf5z9hpd8hg9qmcqv9qv8ywc79pu8n58p6mcqvyyw64qhgu3mhnzf'
)
```

## 單例

`currentNetwork` 是**模組層級狀態**——在應用程式中所有 `useNetwork()` 實例之間共享。在一個元件中呼叫 `switchNetwork()` 會影響所有讀取 `currentNetwork` 的元件。

## 檢查 mainnet 與 testnet

```ts
const network = useNetwork()

if (network.isMainnet.value) {
  // Production behavior
  console.log('Real KAS — be careful!')
}

if (network.isTestnet.value) {
  // testnet-10 or testnet-11
  console.log('Test KAS — free to experiment')
}
```
