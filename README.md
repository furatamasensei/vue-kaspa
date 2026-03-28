# VKAS

> Vue 3 composables and Nuxt module for the Kaspa blockchain — powered by WASM.

[![npm](https://img.shields.io/npm/v/vkas)](https://www.npmjs.com/package/vkas)
[![license](https://img.shields.io/github/license/furatamasensei/vkas)](./LICENSE)

VKAS wraps [`kaspa-wasm`](https://www.npmjs.com/package/kaspa-wasm) with Vue 3 reactivity, giving you idiomatic composables to connect, query, track balances, build transactions, and manage keys — with full TypeScript support.

## Features

- **`useRpc`** — WebSocket RPC connection, 12 query methods, real-time event subscriptions
- **`useUtxo`** — real-time UTXO tracking with reactive balance (mature / pending)
- **`useTransaction`** — estimate, build, sign, and submit transactions; UTXO compounding handled automatically
- **`useCrypto`** — BIP-39 mnemonic, BIP-32 HD derivation, message signing, KAS ↔ sompi conversion
- **`useNetwork`** — network switching (mainnet, testnet-10, testnet-11, simnet, devnet)
- **Nuxt 3 module** — auto-imports, client-only plugin, SSR-safe out of the box
- **Vue DevTools** — inspector panel and event timeline

## Install

```bash
npm install vkas kaspa-wasm
```

## Quick start

### Vue 3

```ts
// main.ts
import { createApp } from 'vue'
import { KaspaPlugin } from 'vkas'
import App from './App.vue'

createApp(App)
  .use(KaspaPlugin, { network: 'mainnet' })
  .mount('#app')
```

```vue
<script setup lang="ts">
import { useUtxo, useTransaction, useCrypto } from 'vkas'

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
  modules: ['vkas/nuxt'],
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
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  optimizeDeps: { exclude: ['kaspa-wasm'] },
})
```

## Documentation

Full docs at **[furatamasensei.github.io/vkas](https://furatamasensei.github.io/vkas)**

- [Installation](https://furatamasensei.github.io/vkas/guide/installation)
- [Vue Plugin](https://furatamasensei.github.io/vkas/guide/vue-plugin)
- [Nuxt Module](https://furatamasensei.github.io/vkas/guide/nuxt-module)
- [useRpc](https://furatamasensei.github.io/vkas/composables/use-rpc)
- [useUtxo](https://furatamasensei.github.io/vkas/composables/use-utxo)
- [useTransaction](https://furatamasensei.github.io/vkas/composables/use-transaction)
- [useCrypto](https://furatamasensei.github.io/vkas/composables/use-crypto)
- [TypeScript Types](https://furatamasensei.github.io/vkas/reference/types)

## Peer dependencies

| Package | Version |
|---|---|
| `vue` | `>=3.4.0` |
| `kaspa-wasm` | `>=1.1.0` |
| `@nuxt/kit` | `^3.0.0` *(Nuxt module only)* |

## Development

```bash
# Start playground + docs
./dev.sh

# Run tests
./dev.sh test

# Rebuild library and restart servers
./dev.sh rebuild
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full setup instructions.

## License

[MIT](./LICENSE)
