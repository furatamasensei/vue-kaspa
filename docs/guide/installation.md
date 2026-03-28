# Installation

## Quick Setup

The fastest way to start is with the CLI — it scaffolds a complete project with WASM, CORS headers, and a working `KaspaStatus` component, all pre-configured:

```bash
npx vue-kaspa-cli
```

You'll be prompted for a project name and your framework of choice (Vue 3 or Nuxt 4):

```
  vue-kaspa-cli — scaffold a Kaspa-connected Vue/Nuxt app

? Project name: kaspa-app
? Framework: Vue
```

Then:

```bash
cd kaspa-app
npm install
npm run dev
```

::: tip Manual setup
Adding vue-kaspa to an **existing** project? Continue with the steps below.
:::

## Prerequisites

- Node.js 18+
- A bundler with WASM support — [Vite](https://vitejs.dev) is recommended

## Install the package

```bash
# npm
npm install vue-kaspa @vue-kaspa/kaspa-wasm

# pnpm
pnpm add vue-kaspa @vue-kaspa/kaspa-wasm

# yarn
yarn add vue-kaspa @vue-kaspa/kaspa-wasm
```

Both `vue-kaspa` and `@vue-kaspa/kaspa-wasm` are required. `@vue-kaspa/kaspa-wasm` provides the underlying WASM bindings; `vue-kaspa` wraps them with Vue reactivity.

## Vite WASM configuration

`@vue-kaspa/kaspa-wasm` uses WebAssembly instantiation. Add `vite-plugin-wasm` to your Vite config:

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

  // Required for SharedArrayBuffer / WASM threading
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

::: tip CORS headers in development
The `Cross-Origin-Embedder-Policy` and `Cross-Origin-Opener-Policy` headers are required for `SharedArrayBuffer` support used internally by `@vue-kaspa/kaspa-wasm`. Without them, WASM initialization will fail in the browser.
:::

::: tip CORS headers in production
The `server.headers` config only applies to the Vite dev server. For production deployments you must set these headers at the hosting layer.

**Vercel** — create a `vercel.json` at the project root:
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

Other hosts (Netlify, Cloudflare Pages, etc.) have equivalent `_headers` file or dashboard settings.
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

The [Nuxt module](/guide/nuxt-module) handles all WASM/SSR configuration automatically — no manual Vite config needed. `@vue-kaspa/kaspa-wasm` is excluded from the server bundle and composables are auto-imported.

For custom SSR setups (non-Nuxt), exclude `@vue-kaspa/kaspa-wasm` from the server bundle:

```ts
// vite.config.ts (SSR)
export default defineConfig({
  ssr: {
    external: ['@vue-kaspa/kaspa-wasm'],
  },
})
```
