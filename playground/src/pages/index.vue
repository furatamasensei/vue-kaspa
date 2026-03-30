<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useKaspa, useNetwork, useRpc } from 'vue-kaspa'
import CodeExample from '../components/CodeExample.vue'

const EXAMPLE = `import { createApp } from 'vue'
import { VueKaspa, useKaspa, useRpc } from 'vue-kaspa'

// Install the plugin
const app = createApp(App)
app.use(VueKaspa, {
  network: 'mainnet',
  autoConnect: true,   // init WASM + connect on mount
  devtools: true,
})

// Inside a component
const kaspa = useKaspa()
const rpc = useRpc()

kaspa.wasmStatus.value     // 'idle' | 'loading' | 'ready' | 'error'
rpc.connectionState.value  // 'disconnected' | 'connecting' | 'connected' | ...
rpc.isConnected.value      // boolean (computed shorthand)
rpc.isSynced.value         // boolean
rpc.virtualDaaScore.value  // BigInt

// Manual control
await kaspa.init()    // load WASM
await rpc.connect()   // connect to node
await rpc.disconnect()`

const kaspa = useKaspa()
const rpc = useRpc()
const network = useNetwork()

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
    await kaspa.init()
    await rpc.connect()
  } catch (e) {
    console.error(e)
  }
}

async function handleDisconnect() {
  await rpc.disconnect()
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
        <Badge :variant="statusVariant[kaspa.wasmStatus.value] ?? 'secondary'">
          {{ kaspa.wasmStatus.value }}
        </Badge>
        <span v-if="kaspa.wasmError.value" class="text-destructive text-sm">
          {{ kaspa.wasmError.value?.message }}
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
          <Badge :variant="connVariant[rpc.connectionState.value] ?? 'secondary'">
            {{ rpc.connectionState.value }}
          </Badge>
          <span v-if="rpc.url.value" class="font-mono text-xs text-muted-foreground">{{ rpc.url.value }}</span>
        </div>

        <div v-if="rpc.isConnected.value" class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Network:</span>
            <span class="text-sm">{{ rpc.networkId.value }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Server Version:</span>
            <span class="text-sm">{{ rpc.serverVersion.value }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Synced:</span>
            <Badge :variant="rpc.isSynced.value ? 'default' : 'outline'">
              {{ rpc.isSynced.value ? 'Yes' : 'Syncing...' }}
            </Badge>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">DAA Score:</span>
            <span class="font-mono text-sm">{{ rpc.virtualDaaScore.value.toString() }}</span>
          </div>
        </div>

        <div class="flex gap-2 pt-1">
          <Button v-if="!rpc.isConnected.value" :disabled="rpc.connectionState.value === 'connecting'"
            @click="initAndConnect">
            {{ rpc.connectionState.value === 'connecting' ? 'Connecting...' : `Connect to
            ${network.currentNetwork.value}` }}
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
        <p v-if="rpc.connectionState.value === 'reconnecting' || rpc.connectionState.value === 'connecting'"
          class="text-sm text-yellow-400">
          Switching network...
        </p>
        <div v-for="n in network.availableNetworks" :key="n"
          class="flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors cursor-pointer" :class="n === network.currentNetwork.value
            ? 'border-primary/50 bg-primary/5'
            : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30'"
          @click="n !== network.currentNetwork.value && network.switchNetwork(n)">
          <Badge :variant="n === network.currentNetwork.value ? 'default' : 'secondary'">{{ n }}</Badge>
          <span class="text-sm text-muted-foreground">{{ networkDescriptions[n] ?? n }}</span>
          <span v-if="n === network.currentNetwork.value" class="ml-auto text-xs text-primary">current</span>
        </div>
      </CardContent>
    </Card>

    <CodeExample :code="EXAMPLE" title="Plugin setup — useKaspa & useRpc" />
  </div>
</template>
