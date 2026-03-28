# Nuxt Module

vue-kaspa ships a first-class Nuxt 3 module. It registers a client-only plugin, auto-imports all composables, and excludes `kaspa-wasm` from the server bundle automatically.

## Setup

```bash
npm install vue-kaspa kaspa-wasm
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

That's all. No manual Vite config, no explicit plugin installation, no import statements in your `.vue` files.

## Module options

The `kaspa` config key accepts the same options as [`KaspaPluginOptions`](/guide/vue-plugin#plugin-options):

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

`kaspa-wasm` is a browser-only WASM package. The Nuxt module handles this in two ways:

1. **Client-only plugin** — `KaspaPlugin` is registered as a Nuxt client plugin. It never runs during server-side rendering.
2. **SSR external** — `kaspa-wasm` is added to `vite.ssr.external`, preventing Vite from trying to bundle or evaluate it on the server.

Composables called in SSR context return safe empty state (e.g., `wasmStatus: 'idle'`, `connectionState: 'disconnected'`) without throwing.

## Custom node on Nuxt

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
