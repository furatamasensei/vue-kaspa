# Vue DevTools

Vue Kaspa terintegrasi dengan [Vue DevTools](https://devtools.vuejs.org) untuk memberikan visibilitas langsung ke status WASM, state RPC, dan event blockchain — tanpa console.log.

Integrasi DevTools diaktifkan secara otomatis dalam mode pengembangan dan dinonaktifkan di produksi.

## Panel inspektor

Inspektor menambahkan node **Kaspa** ke inspektor komponen Vue DevTools. Node ini menampilkan tiga sub-node:

### WASM

| Field | Deskripsi |
|---|---|
| `status` | `WasmStatus` saat ini: `idle` · `loading` · `ready` · `error` |

Kode warna: hijau = `ready`, kuning = `loading`, merah = `error`, abu-abu = `idle`.

### RPC

| Field | Deskripsi |
|---|---|
| `connectionState` | `disconnected` · `connecting` · `connected` · `reconnecting` · `error` |
| `url` | URL node yang terhubung |
| `networkId` | Jaringan yang dilaporkan node (mis. `'mainnet'`) |
| `serverVersion` | Versi perangkat lunak node (mis. `'0.14.1'`) |
| `isSynced` | Apakah node telah tersinkronisasi sepenuhnya |
| `virtualDaaScore` | Skor DAA langsung (diperbarui setiap blok) |

### Network

| Field | Deskripsi |
|---|---|
| `networkId` | ID jaringan aktif dari koneksi RPC |
| `daaScore` | Skor DAA langsung |

## Timeline event

**Timeline** DevTools menyertakan layer **Kaspa Events** (warna: hijau). Semua 11 tipe event RPC diposting di sini saat tiba:

| Event | Level log |
|---|---|
| `block-added` | info |
| `virtual-daa-score-changed` | info |
| `utxos-changed` | info |
| `virtual-chain-changed` | info |
| `sink-blue-score-changed` | info |
| `new-block-template` | info |
| `connect` | info |
| `pruning-point-utxo-set-override` | info |
| `finality-conflict` | warning |
| `finality-conflict-resolved` | info |
| `disconnect` | error |

Setiap event menampilkan ringkasan (hash blok, skor DAA, alamat yang terpengaruh, dll.) dan payload JSON lengkap saat diklik.

## Mengaktifkan dan menonaktifkan

```ts
// Nonaktifkan secara eksplisit (berguna di staging/produksi)
app.use(KaspaPlugin, {
  devtools: false,
})
```

Kode integrasi DevTools diimpor secara dinamis. Ketika `devtools: false`, kode tersebut sepenuhnya tidak ada dalam bundle produksi (tree-shaken).

## Persyaratan

- [Ekstensi browser Vue DevTools](https://devtools.vuejs.org/guide/installation) atau aplikasi Electron standalone
- Vue DevTools API v8 (dibundel dengan `@vue/devtools-api ^8.1.1`, disertakan sebagai dependensi Vue Kaspa)
