<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useVueKaspa } from 'vue-kaspa'
import CodeExample from '../components/CodeExample.vue'

const EXAMPLE = `import { createApp } from 'vue'
import { VueKaspa, useVueKaspa } from 'vue-kaspa'

// Install the plugin
const app = createApp(App)
app.use(VueKaspa, {
  network: 'mainnet',
  autoConnect: true,   // init WASM + connect on mount
  devtools: true,
})

// Inside a component
const vueKaspa = useVueKaspa()

vueKaspa.kaspa.wasmStatus.value       // 'idle' | 'loading' | 'ready' | 'error'
vueKaspa.rpc.connectionState.value    // 'disconnected' | 'connecting' | 'connected' | ...
vueKaspa.rpc.isConnected.value        // boolean (computed shorthand)
vueKaspa.rpc.isSynced.value           // boolean
vueKaspa.rpc.virtualDaaScore.value    // BigInt
vueKaspa.network.currentNetwork.value  // 'mainnet' | 'testnet-10' | ...
vueKaspa.wallet.isConnected.value      // boolean

// Manual control
await vueKaspa.kaspa.init()    // load WASM
await vueKaspa.rpc.connect()   // connect to node
await vueKaspa.rpc.disconnect()`

const vueKaspa = useVueKaspa()

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

const statusVariant: Record<string, BadgeVariant> = {
  idle: 'secondary',
  loading: 'outline',
  ready: 'default',
  error: 'destructive',
}

const connVariant: Record<string, BadgeVariant> = {
  disconnected: 'secondary',
  connecting: 'outline',
  connected: 'default',
  reconnecting: 'outline',
  error: 'destructive',
}

const networkDescriptions: Record<string, string> = {
  'mainnet': 'Kaspa mainnet — production network',
  'testnet-10': 'Testnet v10 — public test network',
  'testnet-12': 'Testnet v12 — newer public test network',
  'simnet': 'Simulation network — local testing',
  'devnet': 'Development network — local development',
}

async function initAndConnect() {
  try {
    await vueKaspa.kaspa.init()
    await vueKaspa.rpc.connect()
  } catch (e) {
    console.error(e)
  }
}

async function handleDisconnect() {
  await vueKaspa.rpc.disconnect()
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Dashboard</h1>

    <!-- WASM Status -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">WASM Status</CardTitle>
      </CardHeader>
      <CardContent class="flex items-center gap-3">
        <Badge :variant="statusVariant[vueKaspa.kaspa.wasmStatus.value] ?? 'secondary'">
          {{ vueKaspa.kaspa.wasmStatus.value }}
        </Badge>
        <span v-if="vueKaspa.kaspa.wasmError.value" class="text-destructive text-sm">
          {{ vueKaspa.kaspa.wasmError.value?.message }}
        </span>
      </CardContent>
    </Card>

    <!-- RPC Connection -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">RPC Connection</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex items-center gap-3">
          <Badge :variant="connVariant[vueKaspa.rpc.connectionState.value] ?? 'secondary'">
            {{ vueKaspa.rpc.connectionState.value }}
          </Badge>
          <span v-if="vueKaspa.rpc.url.value" class="font-mono text-xs text-muted-foreground">{{ vueKaspa.rpc.url.value }}</span>
        </div>

        <div v-if="vueKaspa.rpc.isConnected.value" class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Network:</span>
            <span class="text-sm">{{ vueKaspa.rpc.networkId.value }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Server Version:</span>
            <span class="text-sm">{{ vueKaspa.rpc.serverVersion.value }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Synced:</span>
            <Badge :variant="vueKaspa.rpc.isSynced.value ? 'default' : 'outline'">
              {{ vueKaspa.rpc.isSynced.value ? 'Yes' : 'Syncing...' }}
            </Badge>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">DAA Score:</span>
            <span class="font-mono text-sm">{{ vueKaspa.rpc.virtualDaaScore.value.toString() }}</span>
          </div>
        </div>

        <div class="flex gap-2 pt-1">
          <Button v-if="!vueKaspa.rpc.isConnected.value" :disabled="vueKaspa.rpc.connectionState.value === 'connecting'"
            @click="initAndConnect">
            {{ vueKaspa.rpc.connectionState.value === 'connecting' ? 'Connecting...' : `Connect to
            ${vueKaspa.network.currentNetwork.value}` }}
          </Button>
          <Button v-else variant="secondary" @click="handleDisconnect">Disconnect</Button>
        </div>
      </CardContent>
    </Card>

    <!-- Network Selector -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Network</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        <p v-if="vueKaspa.rpc.connectionState.value === 'reconnecting' || vueKaspa.rpc.connectionState.value === 'connecting'"
          class="text-sm text-yellow-400">
          Switching network...
        </p>
        <div v-for="n in vueKaspa.network.availableNetworks" :key="n"
          class="flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors cursor-pointer" :class="n === vueKaspa.network.currentNetwork.value
            ? 'border-primary/50 bg-primary/5'
            : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30'"
          @click="n !== vueKaspa.network.currentNetwork.value && vueKaspa.network.switchNetwork(n)">
          <Badge :variant="n === vueKaspa.network.currentNetwork.value ? 'default' : 'secondary'">{{ n }}</Badge>
          <span class="text-sm text-muted-foreground">{{ networkDescriptions[n] ?? n }}</span>
          <span v-if="n === vueKaspa.network.currentNetwork.value" class="ml-auto text-xs text-primary">current</span>
        </div>
      </CardContent>
    </Card>

    <CodeExample :code="EXAMPLE" title="Plugin setup — useVueKaspa" />
  </div>
</template>
