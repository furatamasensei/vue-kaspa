# Modul Nuxt

Vue Kaspa menyertakan modul Nuxt kelas satu yang kompatibel dengan **Nuxt 3 dan Nuxt 4**. Modul ini mendaftarkan plugin client-only, melakukan auto-import semua composable, dan menangani semua konfigurasi WASM secara otomatis — tanpa perlu pengaturan Vite manual.

## Pengaturan

```bash
npm install vue-kaspa @vue-kaspa/kaspa-wasm
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: ['vue-kaspa/nuxt'],

  kaspa: {
    network: 'mainnet',
    autoConnect: true,
    panicHook: 'browser',
  },
})
```

Hanya itu. Tidak perlu konfigurasi Vite manual, tidak perlu instalasi plugin eksplisit, tidak perlu pernyataan import di file `.vue` Anda.

## Opsi modul

Kunci konfigurasi `kaspa` menerima opsi yang sama dengan [`VueKaspaOptions`](/id/guide/vue-plugin#plugin-options):

| Opsi | Tipe | Default |
|---|---|---|
| `network` | `KaspaNetwork` | `'mainnet'` |
| `url` | `string` | — |
| `resolver` | `boolean` | `true` |
| `encoding` | `RpcEncoding` | `'Borsh'` |
| `autoConnect` | `boolean` | `true` |
| `devtools` | `boolean` | `true` di dev |
| `panicHook` | `'console' \| 'browser' \| false` | `'browser'` |

::: tip Default Nuxt
Modul Nuxt menggunakan `panicHook` default `'browser'` (menampilkan dialog saat WASM panic) sebagai ganti `'console'`.
:::

## Auto-import

Composable berikut tersedia secara otomatis di semua file `.vue`, `composables/`, dan `pages/` — tidak perlu import:

- `useKaspa`
- `useRpc`
- `useUtxo`
- `useTransaction`
- `useCrypto`
- `useNetwork`

```vue
<!-- pages/wallet.vue — tidak perlu import -->
<script setup lang="ts">
const rpc = useRpc()
const utxo = useUtxo()
</script>
```

## Perilaku SSR

`@vue-kaspa/kaspa-wasm` adalah paket WASM khusus browser. Modul menangani setiap aspek ini secara otomatis:

1. **Plugin client-only** — `VueKaspa` didaftarkan sebagai plugin client Nuxt. Plugin ini tidak pernah berjalan selama server-side rendering. Jika `autoConnect: true` (default), WASM diinisialisasi dan koneksi RPC dibuat secara otomatis saat client dimuat — tidak perlu hook `onMounted` di komponen Anda.
2. **SSR external** — `@vue-kaspa/kaspa-wasm` ditambahkan ke `vite.ssr.external`, mencegah Vite membundle atau mengevaluasinya di server.
3. **Plugin WASM** — `vite-plugin-wasm` ditambahkan ke konfigurasi Vite agar modul WASM dapat diinstansiasi dengan benar di dev maupun build produksi.
4. **Header COOP/COEP** — `Cross-Origin-Embedder-Policy: require-corp` dan `Cross-Origin-Opener-Policy: same-origin` diatur pada server dev Vite dan via Nitro route rules untuk produksi. Header ini diperlukan untuk `SharedArrayBuffer` yang digunakan `kaspa-wasm` secara internal.
5. **optimizeDeps** — `@vue-kaspa/kaspa-wasm` dikecualikan dari pre-bundling dependensi Vite.

Composable yang dipanggil dalam konteks SSR mengembalikan state kosong yang aman (mis. `wasmStatus: 'idle'`, `connectionState: 'disconnected'`) tanpa melempar error.

::: tip Bungkus komponen WASM dengan `<ClientOnly>`
Komponen yang menggunakan composable bergantung WASM (`useRpc`, `useKaspa`, `useUtxo`, dll.) hanya memiliki state aktif setelah plugin client diinisialisasi. Bungkus dengan `<ClientOnly>` untuk mencegah rendering SSR:

```vue
<template>
  <ClientOnly>
    <WalletCard />
  </ClientOnly>
</template>
```
:::

## Node kustom di Nuxt

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: ['vue-kaspa/nuxt'],
  kaspa: {
    network: 'testnet-10',
    url: 'ws://your-node.example.com:17210',
  },
})
```
