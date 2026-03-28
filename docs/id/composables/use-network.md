# useNetwork

Mengelola jaringan yang sedang aktif. Pergantian jaringan secara otomatis memutuskan koneksi RPC saat ini dan menghubungkan kembali ke jaringan baru.

## Import

```ts
import { useNetwork } from 'vue-kaspa'
```

## Tipe kembalian

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

## Properti

| Properti | Tipe | Deskripsi |
|---|---|---|
| `currentNetwork` | `Readonly<Ref<KaspaNetwork>>` | Jaringan yang sedang dipilih |
| `networkId` | `Readonly<Ref<string \| null>>` | String ID jaringan dari node yang terhubung (mis. `'mainnet'`). `null` saat terputus. |
| `isMainnet` | `ComputedRef<boolean>` | `currentNetwork === 'mainnet'` |
| `isTestnet` | `ComputedRef<boolean>` | `currentNetwork === 'testnet-10'` atau `'testnet-11'` |
| `daaScore` | `Readonly<Ref<bigint>>` | Skor DAA langsung — nilai yang sama dengan `useRpc().virtualDaaScore` |
| `availableNetworks` | `readonly KaspaNetwork[]` | Semua 5 nama jaringan (sama dengan konstanta `AVAILABLE_NETWORKS`) |

## Metode

| Metode | Deskripsi |
|---|---|
| `switchNetwork(network)` | Beralih ke jaringan baru: memutuskan RPC, memperbarui `currentNetwork`, menghubungkan kembali. |

## Jaringan yang tersedia

| Jaringan | Deskripsi |
|---|---|
| `'mainnet'` | Jaringan produksi Kaspa |
| `'testnet-10'` | Jaringan uji publik (konsensus v10) |
| `'testnet-11'` | Jaringan uji publik (konsensus v11, DAGKNIGHT) |
| `'simnet'` | Jaringan simulasi lokal untuk pengujian |
| `'devnet'` | Jaringan pengembangan lokal |

## Penggunaan dasar

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

## Pergantian jaringan

```ts
const network = useNetwork()

// Beralih ke testnet-10
await network.switchNetwork('testnet-10')
// network.currentNetwork.value === 'testnet-10'
// RPC secara otomatis terhubung kembali ke node testnet-10
```

`switchNetwork()` bersifat async — menunggu urutan putus koneksi dan koneksi kembali selesai.

## Crypto sadar jaringan

Format alamat bersifat spesifik jaringan. Gunakan `currentNetwork.value` saat memanggil metode `useCrypto()`:

```ts
const network = useNetwork()
const crypto = useCrypto()

// Selalu gunakan jaringan aktif saat menghasilkan/menurunkan alamat
const keypair = crypto.generateKeypair(network.currentNetwork.value)
// mainnet  → 'kaspa:qr...'
// testnet  → 'kaspatest:qr...'

const { receive } = crypto.derivePublicKeys(
  phrase,
  network.currentNetwork.value,
  10,
)
```

Atau gunakan properti computed untuk menjaga alamat tetap sinkron dengan perubahan jaringan:

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

`currentNetwork` adalah **state module-level** — dibagi ke semua instance `useNetwork()` dalam aplikasi. Memanggil `switchNetwork()` di satu komponen mempengaruhi setiap komponen yang membaca `currentNetwork`.

## Memeriksa mainnet vs testnet

```ts
const network = useNetwork()

if (network.isMainnet.value) {
  // Perilaku produksi
  console.log('Real KAS — be careful!')
}

if (network.isTestnet.value) {
  // testnet-10 atau testnet-11
  console.log('Test KAS — free to experiment')
}
```
