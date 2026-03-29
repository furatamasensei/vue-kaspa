# Vue Plugin

## Pengaturan dasar

```ts
// main.ts
import { createApp } from 'vue'
import { KaspaPlugin } from 'vue-kaspa'
import App from './App.vue'

const app = createApp(App)

app.use(KaspaPlugin, {
  network: 'mainnet',
  autoConnect: true,
})

app.mount('#app')
```

Dengan `autoConnect: true` (default), Vue Kaspa secara otomatis menginisialisasi modul WASM dan terhubung ke node Kaspa saat plugin dipasang. Tidak diperlukan pengaturan tambahan di komponen Anda.

## Opsi plugin

Semua opsi bersifat opsional.

| Opsi | Tipe | Default | Deskripsi |
|---|---|---|---|
| `network` | `KaspaNetwork` | `'mainnet'` | Jaringan yang akan dihubungkan |
| `url` | `string` | — | URL WebSocket RPC kustom (mis. `'ws://127.0.0.1:17110'`). Tidak dapat digunakan bersama `resolver`. |
| `resolver` | `boolean` | `true` | Gunakan resolver node Kaspa publik ketika `url` tidak diset |
| `encoding` | `RpcEncoding` | `'Borsh'` | Encoding kawat — `'Borsh'` atau `'SerdeJson'` |
| `autoConnect` | `boolean` | `true` | Otomatis inisialisasi WASM dan hubungkan RPC saat plugin dipasang |
| `devtools` | `boolean` | `true` di dev | Pasang integrasi Vue DevTools |
| `panicHook` | `'console' \| 'browser' \| false` | `'console'` | Handler panic WASM. `'browser'` menampilkan dialog; `false` menonaktifkannya. |

## Menghubungkan ke node kustom

Berikan `url` untuk melewati resolver publik dan terhubung ke node Anda sendiri:

```ts
app.use(KaspaPlugin, {
  network: 'testnet-10',
  url: 'ws://127.0.0.1:17210',
})
```

Ketika `url` diberikan, `resolver` otomatis diset ke `false`.

## Inisialisasi manual

Nonaktifkan `autoConnect` untuk mengontrol kapan WASM dimuat dan RPC terhubung:

```ts
app.use(KaspaPlugin, {
  network: 'mainnet',
  autoConnect: false,
})
```

Kemudian inisialisasi secara manual di sebuah komponen — misalnya, setelah interaksi pengguna:

```vue
<script setup lang="ts">
import { useKaspa, useRpc } from 'vue-kaspa'

const kaspa = useKaspa()
const rpc = useRpc()

async function connect() {
  await kaspa.init()   // muat WASM
  await rpc.connect()  // buka koneksi WebSocket
}
</script>
```

## Testnet / devnet

```ts
app.use(KaspaPlugin, {
  network: 'testnet-10',
  // resolver otomatis memilih node testnet-10
})
```

Jaringan yang tersedia: `'mainnet'` | `'testnet-10'` | `'testnet-12'` | `'simnet'` | `'devnet'`

## Idempotency plugin

Memanggil `app.use(KaspaPlugin)` lebih dari sekali tidak akan berpengaruh — plugin memeriksa instalasi yang sudah ada dan melewati re-inisialisasi secara diam-diam.
