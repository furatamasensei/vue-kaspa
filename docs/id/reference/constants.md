# Konstanta

## AVAILABLE_NETWORKS

```ts
import { AVAILABLE_NETWORKS } from 'vue-kaspa'
```

Array readonly dari semua nilai `KaspaNetwork` yang valid:

```ts
const AVAILABLE_NETWORKS: readonly KaspaNetwork[] = [
  'mainnet',
  'testnet-10',
  'testnet-11',
  'simnet',
  'devnet',
]
```

**Penggunaan:** Buat dropdown pemilih jaringan:

```vue
<script setup lang="ts">
import { AVAILABLE_NETWORKS, useNetwork } from 'vue-kaspa'

const network = useNetwork()
</script>

<template>
  <select
    :value="network.currentNetwork.value"
    @change="network.switchNetwork(($event.target as HTMLSelectElement).value as any)"
  >
    <option v-for="n in AVAILABLE_NETWORKS" :key="n" :value="n">
      {{ n }}
    </option>
  </select>
</template>
```

---

## Nilai WasmStatus

```ts
type WasmStatus = 'idle' | 'loading' | 'ready' | 'error'
```

| Nilai | Deskripsi |
|---|---|
| `'idle'` | WASM belum dimulai — state awal |
| `'loading'` | Mengambil dan mengkompilasi binary WASM |
| `'ready'` | WASM diinisialisasi dan dapat digunakan |
| `'error'` | Inisialisasi gagal — periksa `useKaspa().wasmError` |

---

## Nilai RpcConnectionState

```ts
type RpcConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
```

| Nilai | Deskripsi |
|---|---|
| `'disconnected'` | Tidak terhubung — state awal |
| `'connecting'` | WebSocket sedang dibuka |
| `'connected'` | Koneksi aktif dan sehat |
| `'reconnecting'` | Mencoba terhubung kembali setelah koneksi terputus |
| `'error'` | Koneksi gagal secara permanen (percobaan ulang maksimum terlampaui) |

---

## Nilai RpcEventType

Semua 11 tipe event yang dapat diberikan ke `useRpc().on()`:

```ts
type RpcEventType =
  | 'connect'
  | 'disconnect'
  | 'block-added'
  | 'virtual-chain-changed'
  | 'utxos-changed'
  | 'finality-conflict'
  | 'finality-conflict-resolved'
  | 'sink-blue-score-changed'
  | 'virtual-daa-score-changed'
  | 'new-block-template'
  | 'pruning-point-utxo-set-override'
```

| Event | Frekuensi | Deskripsi |
|---|---|---|
| `'connect'` | Saat terhubung | Koneksi WebSocket terbentuk |
| `'disconnect'` | Saat terputus | Koneksi WebSocket terputus |
| `'block-added'` | ~1/detik | Blok baru ditambahkan ke DAG |
| `'virtual-daa-score-changed'` | ~1/detik | Skor DAA bertambah |
| `'utxos-changed'` | Saat ada aktivitas | UTXO berubah untuk alamat yang berlangganan |
| `'virtual-chain-changed'` | ~1/detik | Selected parent chain diperbarui |
| `'sink-blue-score-changed'` | Sesekali | Skor biru sink diperbarui |
| `'new-block-template'` | ~1/detik | Template mining baru tersedia |
| `'finality-conflict'` | Jarang | Pelanggaran finalitas terdeteksi |
| `'finality-conflict-resolved'` | Jarang | Pelanggaran finalitas diselesaikan |
| `'pruning-point-utxo-set-override'` | Jarang | Pruning point berubah |

---

## Nilai RpcEncoding

```ts
type RpcEncoding = 'Borsh' | 'SerdeJson'
```

| Nilai | Deskripsi |
|---|---|
| `'Borsh'` | Encoding biner — lebih cepat dan lebih kompak (default) |
| `'SerdeJson'` | Encoding JSON — mudah dibaca manusia, berguna untuk debugging |
