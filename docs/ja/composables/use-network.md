# useNetwork

現在アクティブなネットワークを管理します。ネットワークを切り替えると、現在の RPC 接続が切断され、新しいネットワークに自動的に再接続されます。

## インポート

```ts
import { useNetwork } from 'vue-kaspa'
```

## 戻り値の型

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

## プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `currentNetwork` | `Readonly<Ref<KaspaNetwork>>` | 現在選択されているネットワーク |
| `networkId` | `Readonly<Ref<string \| null>>` | 接続中のノードからのネットワーク ID 文字列 (例: `'mainnet'`)。切断時は `null`。 |
| `isMainnet` | `ComputedRef<boolean>` | `currentNetwork === 'mainnet'` |
| `isTestnet` | `ComputedRef<boolean>` | `currentNetwork === 'testnet-10'` または `'testnet-12'` |
| `daaScore` | `Readonly<Ref<bigint>>` | ライブ DAA スコア — `useRpc().virtualDaaScore` と同じ値 |
| `availableNetworks` | `readonly KaspaNetwork[]` | 5 つのネットワーク名すべて (`AVAILABLE_NETWORKS` 定数と同じ) |

## メソッド

| メソッド | 説明 |
|---|---|
| `switchNetwork(network)` | 新しいネットワークに切り替えます: RPC を切断し、`currentNetwork` を更新し、再接続します。 |

## 利用可能なネットワーク

| ネットワーク | 説明 |
|---|---|
| `'mainnet'` | Kaspa 本番ネットワーク |
| `'testnet-10'` | 公開テストネットワーク (v10 コンセンサス) |
| `'testnet-12'` | 公開テストネットワーク (v11 コンセンサス、DAGKNIGHT) |
| `'simnet'` | テスト用ローカルシミュレーションネットワーク |
| `'devnet'` | ローカル開発ネットワーク |

## 基本的な使い方

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

## ネットワークの切り替え

```ts
const network = useNetwork()

// Switch to testnet-10
await network.switchNetwork('testnet-10')
// network.currentNetwork.value === 'testnet-10'
// RPC automatically reconnected to a testnet-10 node
```

`switchNetwork()` は非同期です — 切断と再接続のシーケンスが完了するまで待機します。

## ネットワーク対応の暗号処理

アドレス形式はネットワーク固有です。`useCrypto()` メソッドを呼び出す際は `currentNetwork.value` を使用してください:

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

または computed プロパティを使用して、ネットワーク変更に合わせてアドレスを同期させる:

```ts
const network = useNetwork()
const crypto = useCrypto()

const exampleAddress = computed(() =>
  network.isTestnet.value
    ? 'kaspatest:qqc4gu8kzf5z9hpd8hg9qmcqv9qv8ywc79pu8n58p6mcqvyyw64qhgu3mhnzf'
    : 'kaspa:qqc4gu8kzf5z9hpd8hg9qmcqv9qv8ywc79pu8n58p6mcqvyyw64qhgu3mhnzf'
)
```

## シングルトン

`currentNetwork` は**モジュールレベルの状態** — アプリケーション内のすべての `useNetwork()` インスタンスで共有されます。あるコンポーネントで `switchNetwork()` を呼び出すと、`currentNetwork` を読み取るすべてのコンポーネントに影響します。

## mainnet と testnet の確認

```ts
const network = useNetwork()

if (network.isMainnet.value) {
  // Production behavior
  console.log('Real KAS — be careful!')
}

if (network.isTestnet.value) {
  // testnet-10 or testnet-12
  console.log('Test KAS — free to experiment')
}
```
