# Modul Nuxt

VKAS menyertakan modul Nuxt 3 kelas satu. Modul ini mendaftarkan plugin client-only, melakukan auto-import semua composable, dan secara otomatis mengecualikan `@vue-kaspa/kaspa-wasm` dari bundle server.

## Pengaturan

```bash
npm install vue-kaspa @vue-kaspa/kaspa-wasm
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
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

Kunci konfigurasi `kaspa` menerima opsi yang sama dengan [`KaspaPluginOptions`](/guide/vue-plugin#plugin-options):

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

`@vue-kaspa/kaspa-wasm` adalah paket WASM khusus browser. Modul Nuxt menangani hal ini dengan dua cara:

1. **Plugin client-only** — `KaspaPlugin` didaftarkan sebagai plugin client Nuxt. Plugin ini tidak pernah berjalan selama server-side rendering.
2. **SSR external** — `@vue-kaspa/kaspa-wasm` ditambahkan ke `vite.ssr.external`, mencegah Vite mencoba membundle atau mengevaluasinya di server.

Composable yang dipanggil dalam konteks SSR mengembalikan state kosong yang aman (mis. `wasmStatus: 'idle'`, `connectionState: 'disconnected'`) tanpa melempar error.

## Node kustom di Nuxt

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue-kaspa/nuxt'],
  kaspa: {
    network: 'testnet-10',
    url: 'ws://your-node.example.com:17210',
  },
})
```
