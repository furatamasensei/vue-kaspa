# AI & LLMs

VKAS is designed to be LLM-friendly. All APIs are fully TypeScript-typed, composables have explicit return type interfaces, and machine-readable reference files are available for AI tools.

## Quick reference

```
Package:       vue-kaspa
Version:       0.1.3
npm:           https://www.npmjs.com/package/vue-kaspa
Peer deps:     vue >= 3.4.0, @vue-kaspa/kaspa-wasm >= 1.1.0
Types entry:   ./dist/index.d.ts
Nuxt entry:    vue-kaspa/nuxt
```

**Exports:** `KaspaPlugin`, `useKaspa`, `useRpc`, `useUtxo`, `useTransaction`, `useCrypto`, `useNetwork`, error classes, 23 TypeScript types, `AVAILABLE_NETWORKS`

## Machine-readable files

| File | Description |
|---|---|
| [`/llms.txt`](/llms.txt) | Structured index of docs pages (llmstxt.org standard) |
| [`/llms-full.txt`](/llms-full.txt) | Complete API reference in a single flat file |

These files follow the [llmstxt.org](https://llmstxt.org) convention and can be fetched directly by AI tools, LLM context loaders, or IDE plugins.

## Key facts for LLMs

When generating code that uses VKAS, keep these facts in mind:

**Amounts are always `bigint` in sompi**
```ts
// 1 KAS = 100_000_000n sompi
const amount = crypto.kaspaToSompi('10.5')  // 1_050_000_000n
// Use bigint literals: 1_000_000_000n, NOT 1000000000
```

**WASM is browser-only; autoConnect loads it automatically**
```ts
// With autoConnect: true (default), no manual init needed.
// For lazy loading, use:
await kaspa.init()    // load WASM
await rpc.connect()   // then connect RPC
```

**Network is a singleton — changes affect the whole app**
```ts
await network.switchNetwork('testnet-10')
// currentNetwork.value is now 'testnet-10' everywhere
// Always use network.currentNetwork.value in crypto calls
```

**useRpc event handlers auto-cleanup on component unmount**
```ts
// Inside <script setup> — no manual off() needed:
rpc.on('block-added', handler)
// Automatically removed when component unmounts
```

**useUtxo auto-clears in components; manual clear() needed in stores**
```ts
// Component: auto-cleared on unmount ✓
// Pinia store: call utxo.clear() manually
```

**Pass entries directly to useTransaction**
```ts
// useUtxo().entries.value is directly compatible with CreateTransactionSettings.entries
await tx.send({ entries: utxo.entries.value, ... })
```

**Nuxt auto-imports all composables; no import needed in pages**
```vue
<!-- nuxt pages — just use the composables directly -->
<script setup lang="ts">
const rpc = useRpc()
</script>
```

## Prompt cookbook

Copy these prompts to ask an LLM about VKAS:

### Send KAS to an address

> I'm using vue-kaspa. How do I send 10 KAS from `kaspa:qrsrc...` to `kaspa:qrdest...`? I have the private key hex.

Expected: uses `useUtxo().track()`, `useTransaction().send()`, `useCrypto().kaspaToSompi()`, passes `networkId: 'mainnet'`.

### Derive HD wallet addresses

> Using vue-kaspa's `useCrypto()`, derive the first 10 receive addresses and 5 change addresses from a 24-word BIP-39 mnemonic on mainnet. Show the index and address for each.

Expected: calls `derivePublicKeys(phrase, 'mainnet', 10, 5)`, iterates `receive` and `change` arrays.

### Subscribe to real-time events

> I want to react to new blocks and UTXO changes on my address using vue-kaspa's `useRpc()`. Show me how to subscribe and clean up on component unmount.

Expected: `rpc.on('block-added', ...)`, `rpc.on('utxos-changed', ...)`, notes auto-cleanup inside `<script setup>`.

### Check fee before sending

> Before sending a transaction with vue-kaspa, I want to show the user the estimated fee. How do I use `useTransaction().estimate()` and what does `TransactionSummary` contain?

Expected: calls `tx.estimate(settings)`, explains `fees`, `mass`, `transactions` fields.

### Hardware wallet signing

> I need to sign a Kaspa transaction with a hardware wallet instead of passing a private key directly. How do I use `useTransaction().create()` and `PendingTx`?

Expected: `tx.create(settings)` → iterates `transactions` → calls `pending.addresses()`, then `pending.sign([key])`, then `pending.submit()`.

## Available claude-mem skills

If you have [claude-mem](https://github.com/badass-courses/claude-mem) configured, the following skills are available for this codebase:

| Skill | Description |
|---|---|
| `smart-search` | Search the codebase using AST-aware queries |
| `smart-explore` | Explore code structure without reading full files |
| `make-plan` | Create phased implementation plans |
| `do` | Execute plans via subagents |
| `mem-search` | Search cross-session memory for prior work on this project |

These skills let an LLM navigate and modify the VKAS codebase efficiently without loading entire files into context.
