# Changelog

## v0.1.2

### Perbaikan bug

- **Preservasi nama kelas WASM** — `@vue-kaspa/kaspa-wasm` kini bekerja dengan benar dalam build produksi yang diminifikasi. wasm-bindgen memvalidasi objek JS yang diberikan dengan memeriksa `obj.constructor.name` saat runtime; minifikasi bundler standar mengganti nama semua 76 kelas berbasis WASM menjadi `class e`, menyebabkan error `"object constructor 'e' does not match expected class 'Resolver'"`. Paket vendor kini memanggil `Object.defineProperty(ClassName, 'name', { value: 'ClassName' })` setelah setiap definisi kelas — string literal bertahan dari minifikasi dan memulihkan nama yang benar setelah penamaan ulang kelas. Tidak diperlukan konfigurasi pengguna.

---

## v0.1.1

### Perbaikan bug

- **Singleton WASM terpusat** — semua modul internal kini mengakses `@vue-kaspa/kaspa-wasm` melalui satu helper `loadKaspa()` / `getKaspa()` yang disimpan di `globalThis`. Ini mencegah ketidakcocokan identitas kelas ketika bundler menghasilkan binding kaspa-wasm ke lebih dari satu chunk.
- **Penggantian nama paket** — paket binding WASM yang mendasari diganti namanya menjadi `@vue-kaspa/kaspa-wasm` (scoped, sesuai dengan monorepo).

---

## v0.1.0

Rilis awal.

### Fitur

**Vue Plugin + Nuxt Module**
- `VueKaspa` untuk Vue 3 dengan konfigurasi `VueKaspaOptions` lengkap
- Modul Nuxt 3 (`vue-kaspa/nuxt`) dengan auto-import dan keamanan SSR
- Integrasi Vue DevTools — panel inspektor dan timeline event

**Komposabel**
- `useKaspa` — siklus hidup inisialisasi WASM dengan pelacakan status
- `useRpc` — koneksi RPC WebSocket, 12 metode query, subscription event
- `useUtxo` — pelacakan UTXO real-time, saldo reaktif, auto-cleanup saat unmount
- `useTransaction` — `estimate()`, `create()`, `send()` dengan dukungan UTXO compounding
- `useCrypto` — mnemonic BIP-39, derivasi HD BIP-32, penandatanganan, konversi unit
- `useNetwork` — pergantian jaringan dengan auto-reconnect

**Jaringan yang didukung**
- `mainnet`, `testnet-10`, `testnet-11`, `simnet`, `devnet`

**TypeScript**
- Cakupan tipe lengkap: 23 antarmuka dan tipe union yang diekspor
- Kompatibel dengan mode strict
- Antarmuka tipe kembalian composable (`UseRpcReturn`, `UseUtxoReturn`, dll.)

**Penanganan error**
- Kelas dasar `KaspaError` dengan chaining `.cause`
- `KaspaNotReadyError`, `KaspaRpcError`, `KaspaWalletError`, `KaspaCryptoError`
