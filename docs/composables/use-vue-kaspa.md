# useVueKaspa

`useVueKaspa()` is the unified facade for app code. It bundles the existing composables into one typed object so you can start from a single import and then drill into the subsystem you need.

## Import

```ts
import { useVueKaspa } from 'vue-kaspa'
```

## Signature

```ts
function useVueKaspa(): UseVueKaspaReturn
```

## Return shape

```ts
const vueKaspa = useVueKaspa()

vueKaspa.kaspa      // useKaspa() return value
vueKaspa.rpc        // useRpc() return value
vueKaspa.utxo       // useUtxo() return value
vueKaspa.transaction
vueKaspa.crypto
vueKaspa.network
vueKaspa.wallet
```

## When to use it

Use `useVueKaspa()` when you want the easiest possible app entrypoint:

- one import instead of several
- one object to pass through a component or store
- a single place to discover the available APIs

If you only need one subsystem, the individual composables still remain the better low-level choice.
