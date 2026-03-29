# Vue Plugin

## Basic setup

```ts
// main.ts
import { createApp } from 'vue'
import { KaspaPlugin } from 'vue-kaspa'
import App from './App.vue'

const app = createApp(App)

app.use(KaspaPlugin, {
  network: 'mainnet',
  autoConnect: true,
})

app.mount('#app')
```

With `autoConnect: true` (the default), Vue Kaspa automatically initializes the WASM module and connects to a Kaspa node when the plugin is installed. No further setup is needed in your components.

## Plugin options

All options are optional.

| Option | Type | Default | Description |
|---|---|---|---|
| `network` | `KaspaNetwork` | `'mainnet'` | Network to connect to |
| `url` | `string` | — | Custom RPC WebSocket URL (e.g. `'ws://127.0.0.1:17110'`). Mutually exclusive with `resolver`. |
| `resolver` | `boolean` | `true` | Use the public Kaspa node resolver when `url` is not set |
| `encoding` | `RpcEncoding` | `'Borsh'` | Wire encoding — `'Borsh'` or `'SerdeJson'` |
| `autoConnect` | `boolean` | `true` | Automatically initialize WASM and connect RPC on plugin install |
| `devtools` | `boolean` | `true` in dev | Install Vue DevTools integration |
| `panicHook` | `'console' \| 'browser' \| false` | `'console'` | WASM panic handler. `'browser'` shows a dialog; `false` disables it. |

## Connecting to a custom node

Provide a `url` to bypass the public resolver and connect to your own node:

```ts
app.use(KaspaPlugin, {
  network: 'testnet-10',
  url: 'ws://127.0.0.1:17210',
})
```

When `url` is provided, `resolver` is automatically set to `false`.

## Manual initialization

Disable `autoConnect` to control when WASM loads and the RPC connects:

```ts
app.use(KaspaPlugin, {
  network: 'mainnet',
  autoConnect: false,
})
```

Then initialize manually in a component — for example, after a user interaction:

```vue
<script setup lang="ts">
import { useKaspa, useRpc } from 'vue-kaspa'

const kaspa = useKaspa()
const rpc = useRpc()

async function connect() {
  await kaspa.init()   // load WASM
  await rpc.connect()  // open WebSocket connection
}
</script>
```

## Testnet / devnet

```ts
app.use(KaspaPlugin, {
  network: 'testnet-10',
  // resolver automatically picks a testnet-10 node
})
```

Available networks: `'mainnet'` | `'testnet-10'` | `'testnet-12'` | `'simnet'` | `'devnet'`

## Plugin idempotency

Calling `app.use(KaspaPlugin)` more than once is a no-op — the plugin checks for an existing installation and skips re-initialization silently.
