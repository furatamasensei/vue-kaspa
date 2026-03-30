# useKaspa

Controls the lifecycle of the `@vue-kaspa/kaspa-wasm` WebAssembly module. The WASM module must be initialized before any RPC connections or cryptographic operations can be performed.

## Import

```ts
import { useKaspa } from 'vue-kaspa'
```

## Return type

```ts
interface UseKaspaReturn {
  wasmStatus: Readonly<Ref<WasmStatus>>
  wasmError: Readonly<Ref<Error | null>>
  isReady: ComputedRef<boolean>
  init(): Promise<void>
  reset(): void
}
```

## Properties

| Property | Type | Description |
|---|---|---|
| `wasmStatus` | `Readonly<Ref<WasmStatus>>` | Current WASM lifecycle state |
| `wasmError` | `Readonly<Ref<Error \| null>>` | Error object when `wasmStatus` is `'error'` |
| `isReady` | `ComputedRef<boolean>` | Shorthand: `wasmStatus.value === 'ready'` |

## Methods

| Method | Description |
|---|---|
| `init()` | Load the WASM module. Safe to call multiple times — idempotent. |
| `reset()` | Reset to `'idle'`. Primarily for testing. |

## Status lifecycle

```
idle ──► loading ──► ready
              │
              └──► error (call init() again to retry)
```

| Status | Meaning |
|---|---|
| `'idle'` | Not started |
| `'loading'` | WASM module is being fetched and compiled |
| `'ready'` | WASM initialized and ready |
| `'error'` | Initialization failed — see `wasmError.value` |

## Singleton

The WASM state is **module-level** — shared across all component instances. Calling `init()` from multiple components simultaneously is safe: all calls share the same initialization promise and resolve together.

## Basic usage

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

## With autoConnect

When the plugin is installed with `autoConnect: true` (the default), WASM is initialized automatically. You do not need to call `init()` manually.

```ts
app.use(VueKaspa, { autoConnect: true })
// WASM loads on plugin install — wasmStatus becomes 'ready' before first component mount
```

## Error recovery

```ts
const kaspa = useKaspa()

try {
  await kaspa.init()
} catch {
  // wasmStatus.value is now 'error'
  // wasmError.value contains the reason

  // Retry after fixing the issue (e.g., re-fetching the WASM binary):
  await kaspa.init()
}
```

## Panic hook

The panic hook is configured via the plugin option `panicHook`. It controls what happens when the WASM module encounters an unrecoverable error:

| Value | Behavior |
|---|---|
| `'console'` | Logs the panic message to the browser console (default) |
| `'browser'` | Shows a browser `alert()` dialog with the panic message |
| `false` | No panic handler installed |
