# vue-kaspa

> Vue 3 composables and Nuxt module for the Kaspa blockchain — powered by WASM.

[![npm](https://img.shields.io/npm/v/vue-kaspa)](https://www.npmjs.com/package/vue-kaspa)
[![license](https://img.shields.io/github/license/furatamasensei/vue-kaspa)](https://github.com/furatamasensei/vue-kaspa/blob/main/LICENSE)

vue-kaspa wraps [`@vue-kaspa/kaspa-wasm`](https://www.npmjs.com/package/@vue-kaspa/kaspa-wasm) with Vue 3 reactivity, giving you idiomatic composables to connect, query, track balances, build transactions, and manage keys — with full TypeScript support.

## Features

- **`useRpc`** — WebSocket RPC connection, 12 query methods, real-time event subscriptions
- **`useKaspaRest`** — official REST API wrapper for txid lookup, balances, address history, and explorer data
- **`useUtxo`** — real-time UTXO tracking with reactive balance (mature / pending)
- **`useTransaction`** — estimate, build, sign, and submit transactions; UTXO compounding handled automatically
- **`useCrypto`** — BIP-39 mnemonic, BIP-32 HD derivation, message signing, KAS ↔ sompi conversion
- **`useNetwork`** — network switching (mainnet, testnet-10, testnet-12, simnet, devnet)
- **`useVueKaspa`** — unified facade for the full app workflow
- **Nuxt 3 module** — auto-imports, client-only plugin, SSR-safe out of the box
- **Vue DevTools** — inspector panel and event timeline

## Install

```bash
npm install vue-kaspa @vue-kaspa/kaspa-wasm
```

## Quick start

### Vue 3

```ts
// main.ts
import { createApp } from 'vue'
import { VueKaspa } from 'vue-kaspa'
import App from './App.vue'

createApp(App)
  .use(VueKaspa, { network: 'mainnet' })
  .mount('#app')
```

```vue
<script setup lang="ts">
import { useUtxo, useTransaction, useCrypto } from 'vue-kaspa'

const utxo = useUtxo()
const tx = useTransaction()
const crypto = useCrypto()

await utxo.track(['kaspa:qr...'])

const txIds = await tx.send({
  entries: utxo.entries.value,
  outputs: [{ address: 'kaspa:qdest...', amount: crypto.kaspaToSompi('10') }],
  changeAddress: 'kaspa:qr...',
  priorityFee: 1000n,
  networkId: 'mainnet',
  privateKeys: ['your-private-key-hex'],
})
</script>
```

### Nuxt 3

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue-kaspa/nuxt'],
  kaspa: { network: 'mainnet' },
})
```

All composables are auto-imported — no explicit imports needed in your pages.

### Vite configuration (required)

```bash
npm install -D vite-plugin-wasm vite-plugin-top-level-await
```

```ts
// vite.config.ts
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [vue(), wasm(), topLevelAwait()],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  optimizeDeps: { exclude: ['@vue-kaspa/kaspa-wasm'] },
})
```

## Documentation

Full docs at **[vue-kaspa.vercel.app](https://vue-kaspa.vercel.app)**

- [Installation](https://vue-kaspa.vercel.app/guide/installation)
- [Vue Plugin](https://vue-kaspa.vercel.app/guide/vue-plugin)
- [Nuxt Module](https://vue-kaspa.vercel.app/guide/nuxt-module)
- [useRpc](https://vue-kaspa.vercel.app/composables/use-rpc)
- [useKaspaRest](https://vue-kaspa.vercel.app/composables/use-kaspa-rest)
- [useUtxo](https://vue-kaspa.vercel.app/composables/use-utxo)
- [useTransaction](https://vue-kaspa.vercel.app/composables/use-transaction)
- [useCrypto](https://vue-kaspa.vercel.app/composables/use-crypto)
- [TypeScript Types](https://vue-kaspa.vercel.app/reference/types)

## Peer dependencies

| Package | Version |
|---|---|
| `vue` | `>=3.4.0` |
| `@vue-kaspa/kaspa-wasm` | `>=1.1.0` |
| `@nuxt/kit` | `^3.0.0` *(Nuxt module only)* |

## License

[MIT](https://github.com/furatamasensei/vue-kaspa/blob/main/LICENSE)
