# useNetwork

Manages the currently active network. Switching networks disconnects the current RPC connection and reconnects on the new network automatically.

## Import

```ts
import { useNetwork } from 'vkas'
```

## Return type

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

## Properties

| Property | Type | Description |
|---|---|---|
| `currentNetwork` | `Readonly<Ref<KaspaNetwork>>` | Currently selected network |
| `networkId` | `Readonly<Ref<string \| null>>` | Network ID string from the connected node (e.g. `'mainnet'`). `null` when disconnected. |
| `isMainnet` | `ComputedRef<boolean>` | `currentNetwork === 'mainnet'` |
| `isTestnet` | `ComputedRef<boolean>` | `currentNetwork === 'testnet-10'` or `'testnet-11'` |
| `daaScore` | `Readonly<Ref<bigint>>` | Live DAA score — same value as `useRpc().virtualDaaScore` |
| `availableNetworks` | `readonly KaspaNetwork[]` | All 5 network names (same as `AVAILABLE_NETWORKS` constant) |

## Methods

| Method | Description |
|---|---|
| `switchNetwork(network)` | Switch to a new network: disconnects RPC, updates `currentNetwork`, reconnects. |

## Available networks

| Network | Description |
|---|---|
| `'mainnet'` | Kaspa production network |
| `'testnet-10'` | Public test network (v10 consensus) |
| `'testnet-11'` | Public test network (v11 consensus, DAGKNIGHT) |
| `'simnet'` | Local simulation network for testing |
| `'devnet'` | Local development network |

## Basic usage

```vue
<script setup lang="ts">
import { useNetwork } from 'vkas'

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

## Switching networks

```ts
const network = useNetwork()

// Switch to testnet-10
await network.switchNetwork('testnet-10')
// network.currentNetwork.value === 'testnet-10'
// RPC automatically reconnected to a testnet-10 node
```

`switchNetwork()` is async — it waits for the disconnect and reconnect sequence to complete.

## Network-aware crypto

Address formats are network-specific. Use `currentNetwork.value` when calling `useCrypto()` methods:

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

Or use a computed property to keep addresses in sync with network changes:

```ts
const network = useNetwork()
const crypto = useCrypto()

const exampleAddress = computed(() =>
  network.isTestnet.value
    ? 'kaspatest:qqc4gu8kzf5z9hpd8hg9qmcqv9qv8ywc79pu8n58p6mcqvyyw64qhgu3mhnzf'
    : 'kaspa:qqc4gu8kzf5z9hpd8hg9qmcqv9qv8ywc79pu8n58p6mcqvyyw64qhgu3mhnzf'
)
```

## Singleton

`currentNetwork` is **module-level state** — shared across all `useNetwork()` instances in the application. Calling `switchNetwork()` in one component affects every component that reads `currentNetwork`.

## Checking mainnet vs testnet

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
