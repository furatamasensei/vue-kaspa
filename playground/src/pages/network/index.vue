<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNetwork, useRpc, type KaspaNetwork } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'

const EXAMPLE = `import { useNetwork } from 'vue-kaspa'

const network = useNetwork()

network.currentNetwork.value   // 'mainnet' | 'testnet-10' | 'testnet-11' | ...
network.availableNetworks      // string[] of all supported networks
network.daaScore.value         // BigInt — live DAA score (reactive)

// Switch network — reconnects RPC automatically
await network.switchNetwork('testnet-10')`

const network = useNetwork()
const rpc = useRpc()

const networkDescriptions: Record<string, string> = {
  mainnet: 'Kaspa mainnet — production network (kaspa: prefix)',
  'testnet-10': 'Testnet v10 — public test network (kaspatest: prefix)',
  'testnet-11': 'Testnet v11 — newer public test network (kaspatest: prefix)',
  simnet: 'Simulation network — local testing',
  devnet: 'Development network — local development',
}

async function select(n: KaspaNetwork) {
  await network.switchNetwork(n)
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Network Switcher</h1>

    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Current Network</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        <div class="flex items-center gap-3">
          <Badge variant="default" class="text-sm px-3 py-1">{{ network.currentNetwork.value }}</Badge>
          <span v-if="rpc.networkId.value" class="text-sm text-muted-foreground">
            ID: {{ rpc.networkId.value }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">DAA Score:</span>
          <span class="font-mono text-sm">{{ network.daaScore.value.toString() }}</span>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Available Networks</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        <div v-for="n in network.availableNetworks" :key="n"
          class="flex items-center gap-3 rounded-md border px-3 py-3 transition-colors cursor-pointer" :class="n === network.currentNetwork.value
            ? 'border-primary/50 bg-primary/5'
            : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30'" @click="select(n)">
          <Badge :variant="n === network.currentNetwork.value ? 'default' : 'secondary'"
            class="min-w-[100px] justify-center">{{ n }}</Badge>
          <span class="text-sm text-muted-foreground">{{ networkDescriptions[n] ?? n }}</span>
        </div>
      </CardContent>
    </Card>

    <CodeExample :code="EXAMPLE" title="useNetwork — switch networks" />
  </div>
</template>
