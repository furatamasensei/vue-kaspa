# useKaspa

Mengontrol siklus hidup modul WebAssembly `@vue-kaspa/kaspa-wasm`. Modul WASM harus diinisialisasi sebelum koneksi RPC atau operasi kriptografi apa pun dapat dilakukan.

## Import

```ts
import { useKaspa } from 'vue-kaspa'
```

## Tipe kembalian

```ts
interface UseKaspaReturn {
  wasmStatus: Readonly<Ref<WasmStatus>>
  wasmError: Readonly<Ref<Error | null>>
  isReady: ComputedRef<boolean>
  init(): Promise<void>
  reset(): void
}
```

## Properti

| Properti | Tipe | Deskripsi |
|---|---|---|
| `wasmStatus` | `Readonly<Ref<WasmStatus>>` | State siklus hidup WASM saat ini |
| `wasmError` | `Readonly<Ref<Error \| null>>` | Objek error ketika `wasmStatus` adalah `'error'` |
| `isReady` | `ComputedRef<boolean>` | Singkatan: `wasmStatus.value === 'ready'` |

## Metode

| Metode | Deskripsi |
|---|---|
| `init()` | Muat modul WASM. Aman dipanggil berkali-kali — idempotent. |
| `reset()` | Reset ke `'idle'`. Terutama untuk pengujian. |

## Siklus hidup status

```
idle ──► loading ──► ready
              │
              └──► error (panggil init() lagi untuk mencoba ulang)
```

| Status | Arti |
|---|---|
| `'idle'` | Belum dimulai |
| `'loading'` | Modul WASM sedang diambil dan dikompilasi |
| `'ready'` | WASM diinisialisasi dan siap digunakan |
| `'error'` | Inisialisasi gagal — lihat `wasmError.value` |

## Singleton

State WASM bersifat **module-level** — dibagi ke semua instance komponen. Memanggil `init()` dari banyak komponen secara bersamaan aman: semua panggilan berbagi promise inisialisasi yang sama dan resolve bersama-sama.

## Penggunaan dasar

```vue
<script setup lang="ts">
import { useKaspa } from 'vue-kaspa'
import { onMounted } from 'vue'

const kaspa = useKaspa()

onMounted(async () => {
  await kaspa.init()
  // kaspa.wasmStatus.value === 'ready'
})
</script>

<template>
  <div>
    <span v-if="kaspa.isReady.value">WASM ready</span>
    <span v-else-if="kaspa.wasmStatus.value === 'loading'">Loading WASM...</span>
    <span v-else-if="kaspa.wasmStatus.value === 'error'" class="error">
      Error: {{ kaspa.wasmError.value?.message }}
    </span>
  </div>
</template>
```

## Dengan autoConnect

Ketika plugin dipasang dengan `autoConnect: true` (default), WASM diinisialisasi secara otomatis. Anda tidak perlu memanggil `init()` secara manual.

```ts
app.use(VueKaspa, { autoConnect: true })
// WASM dimuat saat plugin dipasang — wasmStatus menjadi 'ready' sebelum mount komponen pertama
```

## Pemulihan dari error

```ts
const kaspa = useKaspa()

try {
  await kaspa.init()
} catch {
  // wasmStatus.value sekarang 'error'
  // wasmError.value berisi alasannya

  // Coba lagi setelah memperbaiki masalah (mis. mengambil ulang binary WASM):
  await kaspa.init()
}
```

## Panic hook

Panic hook dikonfigurasi melalui opsi plugin `panicHook`. Opsi ini mengontrol apa yang terjadi ketika modul WASM mengalami error yang tidak dapat dipulihkan:

| Nilai | Perilaku |
|---|---|
| `'console'` | Mencatat pesan panic ke konsol browser (default) |
| `'browser'` | Menampilkan dialog browser `alert()` dengan pesan panic |
| `false` | Tidak ada handler panic yang dipasang |
