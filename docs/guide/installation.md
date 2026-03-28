# Installation

## Prerequisites

- Node.js 18+
- A bundler with WASM support — [Vite](https://vitejs.dev) is recommended

## Install the package

```bash
# npm
npm install vkas kaspa-wasm

# pnpm
pnpm add vkas kaspa-wasm

# yarn
yarn add vkas kaspa-wasm
```

Both `vkas` and `kaspa-wasm` are required. `kaspa-wasm` provides the underlying WASM bindings; `vkas` wraps them with Vue reactivity.

## Vite WASM configuration

`kaspa-wasm` uses top-level `await` and WebAssembly instantiation. Vite needs two plugins to handle this:

```bash
npm install -D vite-plugin-wasm vite-plugin-top-level-await
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [vue(), wasm(), topLevelAwait()],

  // Required for SharedArrayBuffer / WASM threading
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },

  optimizeDeps: {
    exclude: ['kaspa-wasm'],
  },
})
```

::: tip CORS headers
The `Cross-Origin-Embedder-Policy` and `Cross-Origin-Opener-Policy` headers are required for `SharedArrayBuffer` support used internally by `kaspa-wasm`. Without them, WASM initialization will fail in the browser.
:::

## TypeScript configuration

Ensure your `tsconfig.json` targets ES2020 or later (required for `BigInt`):

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

The [Nuxt module](/guide/nuxt-module) handles all WASM/SSR configuration automatically — no manual Vite config needed. `kaspa-wasm` is excluded from the server bundle and composables are auto-imported.

For custom SSR setups (non-Nuxt), exclude `kaspa-wasm` from the server bundle:

```ts
// vite.config.ts (SSR)
export default defineConfig({
  ssr: {
    external: ['kaspa-wasm'],
  },
})
```
