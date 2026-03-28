# Instalasi

## Prasyarat

- Node.js 18+
- Bundler dengan dukungan WASM — [Vite](https://vitejs.dev) direkomendasikan

## Pasang paket

```bash
# npm
npm install vue-kaspa @vue-kaspa/kaspa-wasm

# pnpm
pnpm add vue-kaspa @vue-kaspa/kaspa-wasm

# yarn
yarn add vue-kaspa @vue-kaspa/kaspa-wasm
```

Keduanya `vue-kaspa` dan `@vue-kaspa/kaspa-wasm` diperlukan. `@vue-kaspa/kaspa-wasm` menyediakan binding WASM yang mendasari; `vue-kaspa` membungkusnya dengan Vue reactivity.

## Konfigurasi Vite untuk WASM

`@vue-kaspa/kaspa-wasm` menggunakan instansiasi WebAssembly. Tambahkan `vite-plugin-wasm` ke konfigurasi Vite Anda:

```bash
npm install -D vite-plugin-wasm
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  plugins: [vue(), wasm()],

  // Diperlukan untuk SharedArrayBuffer / WASM threading
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },

  optimizeDeps: {
    exclude: ['@vue-kaspa/kaspa-wasm'],
  },
})
```

::: tip Header CORS saat pengembangan
Header `Cross-Origin-Embedder-Policy` dan `Cross-Origin-Opener-Policy` diperlukan untuk dukungan `SharedArrayBuffer` yang digunakan secara internal oleh `@vue-kaspa/kaspa-wasm`. Tanpa header ini, inisialisasi WASM akan gagal di browser.
:::

::: tip Header CORS di produksi
Konfigurasi `server.headers` hanya berlaku untuk server dev Vite. Untuk deployment produksi, Anda harus mengatur header ini di lapisan hosting.

**Vercel** — buat file `vercel.json` di root proyek:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]
    }
  ]
}
```

Host lain (Netlify, Cloudflare Pages, dll.) memiliki file `_headers` atau pengaturan dashboard yang setara.
:::

## Konfigurasi TypeScript

Pastikan `tsconfig.json` Anda menargetkan ES2020 atau lebih baru (diperlukan untuk `BigInt`):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "bundler"
  }
}
```

## SSR / Nuxt

[Modul Nuxt](/guide/nuxt-module) menangani semua konfigurasi WASM/SSR secara otomatis — tidak perlu konfigurasi Vite manual. `@vue-kaspa/kaspa-wasm` dikecualikan dari bundle server dan composable di-auto-import.

Untuk setup SSR kustom (non-Nuxt), kecualikan `@vue-kaspa/kaspa-wasm` dari bundle server:

```ts
// vite.config.ts (SSR)
export default defineConfig({
  ssr: {
    external: ['@vue-kaspa/kaspa-wasm'],
  },
})
```
