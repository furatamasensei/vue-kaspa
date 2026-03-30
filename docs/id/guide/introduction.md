# Pengantar

**Vue Kaspa** adalah plugin Vue 3 yang menyediakan composable reaktif untuk berinteraksi dengan blockchain [Kaspa](https://kaspa.org). Plugin ini membungkus [`@vue-kaspa/kaspa-wasm`](https://www.npmjs.com/package/@vue-kaspa/kaspa-wasm) — SDK WebAssembly resmi — dan mengekspos fungsionalitasnya melalui API Vue 3 yang idiomatis.

## Apa yang Anda dapatkan

Enam composable yang mencakup alur kerja lengkap:

| Composable | Fungsi |
|---|---|
| [`useKaspa`](/composables/use-kaspa) | Siklus hidup inisialisasi WASM |
| [`useRpc`](/composables/use-rpc) | Koneksi RPC WebSocket, query, dan event |
| [`useUtxo`](/composables/use-utxo) | Pelacakan UTXO real-time dan saldo reaktif |
| [`useTransaction`](/composables/use-transaction) | Pembuatan, penandatanganan, dan pengiriman transaksi |
| [`useCrypto`](/composables/use-crypto) | Pembuatan kunci, derivasi HD, penandatanganan, konversi unit |
| [`useNetwork`](/composables/use-network) | Pergantian jaringan (mainnet, testnet, dll.) |

## Arsitektur

```
┌─────────────────────────────────────────────────────┐
│  Komponen Vue / halaman Nuxt Anda                   │
│  useRpc()  useUtxo()  useTransaction()  useCrypto() │
└──────────────────────┬──────────────────────────────┘
                       │ Vue reactivity
┌──────────────────────▼──────────────────────────────┐
│  Singleton internal (dibagi ke semua komponen)      │
│  RpcManager · WasmLoader · EventBridge              │
└──────────────────────┬──────────────────────────────┘
                       │ WASM calls
┌──────────────────────▼──────────────────────────────┐
│  @vue-kaspa/kaspa-wasm (WebAssembly)                           │
│  RpcClient · PrivateKey · XPrv · createTransactions │
└─────────────────────────────────────────────────────┘
```

Singleton internal bersifat module-level — terdapat **satu koneksi RPC** dan **satu instance WASM** per aplikasi, yang dibagi ke semua instance composable. Ini disengaja: sebuah tab browser tidak seharusnya membuka banyak koneksi WebSocket ke node Kaspa.

## Permukaan API publik

```ts
// Plugin
import { VueKaspa } from 'vue-kaspa'

// Composables
import { useKaspa, useRpc, useUtxo, useTransaction, useCrypto, useNetwork } from 'vue-kaspa'

// Kelas error
import { KaspaError, KaspaNotReadyError, KaspaRpcError, KaspaWalletError, KaspaCryptoError } from 'vue-kaspa'

// Tipe (TypeScript)
import type { VueKaspaOptions, KaspaNetwork, UtxoEntry, PendingTx, /* ... */ } from 'vue-kaspa'

// Konstanta
import { AVAILABLE_NETWORKS } from 'vue-kaspa'
```

## Dependensi peer

| Paket | Versi |
|---|---|
| `vue` | `>=3.4.0` |
| `@vue-kaspa/kaspa-wasm` | `>=1.1.0` |
| `@nuxt/kit` | `^3.0.0` *(opsional — hanya diperlukan untuk modul Nuxt)* |

## Prinsip desain

- **State singleton** — satu koneksi RPC dan satu instance WASM per aplikasi. Memanggil `useRpc()` dari 10 komponen semuanya mengembalikan state reaktif yang sama.
- **Lazy loading WASM** — modul WASM tidak dimuat sampai `useKaspa().init()` dipanggil (atau secara otomatis saat plugin dipasang ketika `autoConnect: true`).
- **Auto-cleanup** — composable yang digunakan di dalam komponen Vue secara otomatis membersihkan subscription dan event handler saat `onUnmounted`.
- **TypeScript-first** — semua tipe kembalian composable, opsi, dan struktur data sepenuhnya diketik melalui antarmuka yang diekspor.
- **Tree-shakeable** — integrasi DevTools diimpor secara dinamis dan tidak ada dalam bundle produksi ketika `devtools: false`.
