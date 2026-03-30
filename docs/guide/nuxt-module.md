# Nuxt Module

Vue Kaspa ships a first-class Nuxt module compatible with **Nuxt 3 and Nuxt 4**. It registers a client-only plugin, auto-imports all composables, and handles all WASM configuration automatically — no manual Vite setup needed.

## Setup

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

That's all. No manual Vite config, no explicit plugin installation, no import statements in your `.vue` files.

## Module options

The `kaspa` config key accepts the same options as [`VueKaspaOptions`](/guide/vue-plugin#plugin-options):

| Option | Type | Default |
|---|---|---|
| `network` | `KaspaNetwork` | `'mainnet'` |
| `url` | `string` | — |
| `resolver` | `boolean` | `true` |
| `encoding` | `RpcEncoding` | `'Borsh'` |
| `autoConnect` | `boolean` | `true` |
| `devtools` | `boolean` | `true` in dev |
| `panicHook` | `'console' \| 'browser' \| false` | `'browser'` |

::: tip Nuxt default
The Nuxt module defaults `panicHook` to `'browser'` (shows a dialog on WASM panic) instead of `'console'`.
:::

## Auto-imports

The following composables are automatically available in all `.vue` files, `composables/`, and `pages/` — no import needed:

- `useKaspa`
- `useRpc`
- `useUtxo`
- `useTransaction`
- `useCrypto`
- `useNetwork`

```vue
<!-- pages/wallet.vue — no imports needed -->
<script setup lang="ts">
const rpc = useRpc()
const utxo = useUtxo()
</script>
```

## SSR behavior

`@vue-kaspa/kaspa-wasm` is a browser-only WASM package. The module handles every aspect of this automatically:

1. **Client-only plugin** — `VueKaspa` is registered as a Nuxt client plugin. It never runs during server-side rendering. When `autoConnect: true` (the default), WASM is initialised and the RPC connection is established automatically as soon as the client loads — no `onMounted` call needed in your components.
2. **SSR external** — `@vue-kaspa/kaspa-wasm` is added to `vite.ssr.external`, preventing Vite from bundling or evaluating it on the server.
3. **WASM plugin** — `vite-plugin-wasm` is added to the Vite config so WASM modules instantiate correctly in both dev and production builds.
4. **COOP/COEP headers** — `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin` are set on the Vite dev server and via Nitro route rules for production. These are required for `SharedArrayBuffer`, which `kaspa-wasm` uses internally.
5. **optimizeDeps** — `@vue-kaspa/kaspa-wasm` is excluded from Vite's dependency pre-bundling.

Composables called in SSR context return safe empty state (e.g. `wasmStatus: 'idle'`, `connectionState: 'disconnected'`) without throwing.

::: tip Wrap WASM components in `<ClientOnly>`
Components that use WASM-dependent composables (`useRpc`, `useKaspa`, `useUtxo`, etc.) only have live state after the client plugin initialises. Wrap them in `<ClientOnly>` to prevent SSR rendering:

```vue
<template>
  <ClientOnly>
    <WalletCard />
  </ClientOnly>
</template>
```
:::

## Custom node on Nuxt

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
