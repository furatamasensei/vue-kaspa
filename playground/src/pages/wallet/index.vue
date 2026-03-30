<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectWallet, useWallet, type WalletProvider } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'

const EXAMPLE = `import { ConnectWallet, useWallet } from 'vue-kaspa'

// Drop-in component — handles the full connect/disconnect flow
// <ConnectWallet />

// Or use the composable directly for full control
const wallet = useWallet()

wallet.isKaswareInstalled.value   // boolean
wallet.isKastleInstalled.value    // boolean

await wallet.connect('kasware')   // or 'kastle'
await wallet.connect('kastle', 'testnet-10')

wallet.isConnected.value          // boolean
wallet.provider.value             // 'kasware' | 'kastle' | null
wallet.address.value              // 'kaspa:q...'
wallet.publicKey.value            // hex public key
wallet.network.value              // 'mainnet' | 'testnet-10' | ...
wallet.balance.value              // { confirmed, unconfirmed, total } in sompi

// KasWare only
await wallet.sendKaspa('kaspa:q...', 100_000_000n)
await wallet.signMessage('hello')

await wallet.disconnect()`

const wallet = useWallet()

const kasBalance = computed(() => {
  const total = wallet.balance.value?.total
  if (total === undefined) return null
  return (Number(total) / 1e8).toFixed(4)
})

const confirmedBalance = computed(() => {
  const confirmed = wallet.balance.value?.confirmed
  if (confirmed === undefined) return null
  return (Number(confirmed) / 1e8).toFixed(4)
})

const truncatedAddress = computed(() => {
  const addr = wallet.address.value
  if (!addr) return null
  return `${addr.slice(0, 12)}…${addr.slice(-8)}`
})

const providerLabel: Record<WalletProvider, string> = {
  kasware: 'KasWare',
  kastle: 'Kastle',
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-primary">Wallet Connect</h1>

    <!-- ConnectWallet component demo -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-base">ConnectWallet Component</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- CSS variables for the component theming -->
        <div class="ks-theme">
          <ConnectWallet
            :show-balance="true"
            :show-network="true"
            @connected="(p) => console.log('connected', p)"
            @disconnected="() => console.log('disconnected')"
            @error="(e) => console.error(e)"
          />
        </div>

        <p class="text-xs text-muted-foreground">
          KasWare and Kastle browser extensions are detected automatically.
          Not installed wallets show an install link.
        </p>
      </CardContent>
    </Card>

    <!-- Live wallet state -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-base">Live Wallet State</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <span class="text-muted-foreground">Status</span>
          <span>
            <Badge :variant="wallet.isConnected.value ? 'default' : 'secondary'">
              {{ wallet.isConnected.value ? 'connected' : 'disconnected' }}
            </Badge>
          </span>

          <span class="text-muted-foreground">Provider</span>
          <span class="font-mono">
            {{ wallet.provider.value ? providerLabel[wallet.provider.value] : '—' }}
          </span>

          <span class="text-muted-foreground">Network</span>
          <span class="font-mono">{{ wallet.network.value ?? '—' }}</span>

          <span class="text-muted-foreground">Address</span>
          <span class="font-mono text-xs break-all">{{ truncatedAddress ?? '—' }}</span>

          <template v-if="kasBalance !== null">
            <span class="text-muted-foreground">Balance (total)</span>
            <span class="font-mono">{{ kasBalance }} KAS</span>

            <span class="text-muted-foreground">Confirmed</span>
            <span class="font-mono">{{ confirmedBalance }} KAS</span>
          </template>
        </div>

        <div class="flex gap-2 text-sm pt-1">
          <span class="text-muted-foreground">KasWare installed:</span>
          <Badge :variant="wallet.isKaswareInstalled.value ? 'default' : 'secondary'" class="text-xs">
            {{ wallet.isKaswareInstalled.value ? 'yes' : 'no' }}
          </Badge>
          <span class="text-muted-foreground ml-2">Kastle installed:</span>
          <Badge :variant="wallet.isKastleInstalled.value ? 'default' : 'secondary'" class="text-xs">
            {{ wallet.isKastleInstalled.value ? 'yes' : 'no' }}
          </Badge>
        </div>
      </CardContent>
    </Card>

    <CodeExample :code="EXAMPLE" title="useWallet + ConnectWallet" />
  </div>
</template>

<style scoped>
/* Map playground Tailwind theme to --ks-* vars so ConnectWallet fits in */
.ks-theme {
  --ks-surface:  var(--card);
  --ks-soft:     var(--muted);
  --ks-border:   var(--border);
  --ks-heading:  var(--card-foreground);
  --ks-text:     var(--foreground);
  --ks-muted:    var(--muted-foreground);
  --ks-accent:   #49c5a3;
}
</style>
