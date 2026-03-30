# ConnectWallet

A pre-built wallet connection button that handles the full connect/disconnect flow for **KasWare** and **Kastle** browser wallets. Drop it into your app and customize through props and slots.

## Import

```ts
import { ConnectWallet } from 'vue-kaspa'
```

## Basic usage

```vue
<script setup lang="ts">
import { ConnectWallet } from 'vue-kaspa'
</script>

<template>
  <ConnectWallet />
</template>
```

This renders a "Connect Wallet" button. Clicking it opens a wallet selection menu. Once connected, it shows the truncated address and a dropdown with disconnect.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `wallets` | `WalletProvider[]` | `['kasware', 'kastle']` | Which wallet providers to offer |
| `network` | `string` | `'mainnet'` | Target network passed to Kastle on connect. Ignored for KasWare. |
| `label` | `string` | `'Connect Wallet'` | Button text when disconnected |
| `showBalance` | `boolean` | `false` | Show KAS balance in the connected dropdown (KasWare only) |
| `showNetwork` | `boolean` | `true` | Show a network badge next to the connected address |
| `truncate` | `number` | `6` | Address characters to show at each end |

## Events

| Event | Payload | Description |
|---|---|---|
| `connected` | `{ provider, address, publicKey }` | Fires when a wallet connects successfully |
| `disconnected` | — | Fires when the wallet disconnects |
| `error` | `Error` | Fires when a connection attempt fails |

```vue
<ConnectWallet
  @connected="({ address }) => console.log('Connected:', address)"
  @disconnected="console.log('Disconnected')"
  @error="(err) => console.error(err)"
/>
```

## Slots

### `trigger`

Replaces the default "Connect Wallet" button. Receives `open` (boolean) and `toggle` (function) as slot props.

```vue
<ConnectWallet>
  <template #trigger="{ open, toggle }">
    <button class="my-btn" @click="toggle">
      {{ open ? 'Cancel' : 'Connect' }}
    </button>
  </template>
</ConnectWallet>
```

### `icon-kasware` / `icon-kastle`

Replace the icon shown next to each wallet option in the selection menu.

```vue
<ConnectWallet>
  <template #icon-kasware>
    <img src="/kasware-logo.png" alt="KasWare" width="28" height="28" />
  </template>
  <template #icon-kastle>
    <img src="/kastle-logo.png" alt="Kastle" width="28" height="28" />
  </template>
</ConnectWallet>
```

### `connected`

Replaces the entire connected state display. Receives the full wallet context as slot props.

```vue
<ConnectWallet>
  <template #connected="{ address, network, balance, truncatedAddress, disconnect }">
    <div class="my-wallet-indicator">
      <span>{{ truncatedAddress }}</span>
      <span>{{ network }}</span>
      <button @click="disconnect">Sign out</button>
    </div>
  </template>
</ConnectWallet>
```

**Slot props for `connected`:**

| Prop | Type | Description |
|---|---|---|
| `provider` | `WalletProvider \| null` | Active wallet provider |
| `address` | `string \| null` | Full connected address |
| `publicKey` | `string \| null` | Connected public key |
| `balance` | `WalletBalance \| null` | Balance in sompi (KasWare only) |
| `network` | `string \| null` | Active network |
| `truncatedAddress` | `string` | Pre-truncated address string |
| `disconnect` | `() => void` | Call to disconnect |

## Customization examples

### Only KasWare

```vue
<ConnectWallet :wallets="['kasware']" />
```

### Only Kastle on testnet

```vue
<ConnectWallet :wallets="['kastle']" network="testnet-10" />
```

### Show balance

```vue
<ConnectWallet :show-balance="true" />
```

### Custom label and longer address

```vue
<ConnectWallet label="Connect your wallet" :truncate="10" />
```

### Listening to events

```vue
<script setup lang="ts">
import { ConnectWallet } from 'vue-kaspa'
import type { WalletProvider } from 'vue-kaspa'

function onConnected(payload: { provider: WalletProvider; address: string; publicKey: string }) {
  console.log(`${payload.provider} connected: ${payload.address}`)
}
</script>

<template>
  <ConnectWallet @connected="onConnected" />
</template>
```

## Theming

`ConnectWallet` reads from the same `--ks-*` CSS variables used by the CLI templates. Define them on your root element to control colors:

```css
:root {
  --ks-surface:  #ffffff;
  --ks-soft:     #f4f4f5;
  --ks-border:   #e4e4e7;
  --ks-heading:  #18181b;
  --ks-text:     #3f3f46;
  --ks-muted:    #a1a1aa;
  --ks-accent:   #49c5a3;
}

.dark {
  --ks-surface:  #09090b;
  --ks-soft:     #18181b;
  --ks-border:   #27272a;
  --ks-heading:  #fafafa;
  --ks-text:     #a1a1aa;
  --ks-muted:    #52525b;
}
```

If you haven't set these variables, the component falls back to hardcoded light-mode values.

## Using `useWallet` alongside

`ConnectWallet` is built on top of `useWallet()`. Since both share module-level state, you can read wallet state anywhere in your app without prop-drilling:

```vue
<script setup lang="ts">
import { ConnectWallet, useWallet } from 'vue-kaspa'

const wallet = useWallet()
</script>

<template>
  <!-- Put the button in your header -->
  <ConnectWallet />

  <!-- Read the state anywhere -->
  <p v-if="wallet.isConnected.value">
    Sending from {{ wallet.address.value }}
  </p>
</template>
```
