<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ref } from 'vue'
import { useRpc, type ConnectedPeerInfo } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'

const EXAMPLE = `import { useRpc } from 'vue-kaspa'

const rpc = useRpc()

// Sync status
const { isSynced } = await rpc.getSyncStatus()

// Network hash rate (1000-block window)
const { networkHashesPerSecond } = await rpc.estimateNetworkHashesPerSecond(1000)

// Connected peers
const peers = await rpc.getConnectedPeerInfo()
// peers[0].id, peers[0].address, peers[0].isOutbound

// Known & banned peer addresses
const { known, banned } = await rpc.getPeerAddresses()

// All metrics (raw)
const metrics = await rpc.getMetrics()`

const rpc = useRpc()
const syncStatus = ref<{ isSynced: boolean } | null>(null)
const hashRate = ref<bigint | null>(null)
const peers = ref<ConnectedPeerInfo[]>([])
const peerAddresses = ref<{ known: unknown[]; banned: unknown[] } | null>(null)
const currentNetwork = ref<string | null>(null)
const windowSize = ref(1000)
const loading = ref(false)
const error = ref<string | null>(null)

async function fetchAll() {
  loading.value = true
  error.value = null
  try {
    const [sync, hashResult, peerInfo, peerAddrs, network] = await Promise.all([
      rpc.getSyncStatus(),
      rpc.estimateNetworkHashesPerSecond(windowSize.value),
      rpc.getConnectedPeerInfo(),
      rpc.getPeerAddresses(),
      rpc.getCurrentNetwork(),
    ])
    syncStatus.value = sync
    hashRate.value = hashResult.networkHashesPerSecond
    peers.value = peerInfo
    peerAddresses.value = peerAddrs
    currentNetwork.value = network
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

function formatHashRate(h: bigint): string {
  const n = Number(h)
  if (n >= 1e18) return (n / 1e18).toFixed(2) + ' EH/s'
  if (n >= 1e15) return (n / 1e15).toFixed(2) + ' PH/s'
  if (n >= 1e12) return (n / 1e12).toFixed(2) + ' TH/s'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' GH/s'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + ' MH/s'
  return n.toLocaleString() + ' H/s'
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Network Stats</h1>

    <Card>
      <CardContent class="pt-6 space-y-3">
        <div class="space-y-1">
          <label class="text-sm text-muted-foreground">Hash Rate Window (blocks)</label>
          <Input v-model.number="windowSize" type="number" class="w-40" />
        </div>
        <Button :disabled="loading" @click="fetchAll">
          {{ loading ? 'Loading...' : 'Fetch Network Stats' }}
        </Button>
      </CardContent>
    </Card>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <template v-if="syncStatus !== null">
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Overview</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2 text-sm">
          <div class="flex gap-2">
            <span class="text-muted-foreground w-44 shrink-0">Network</span>
            <span class="font-mono">{{ currentNetwork ?? '—' }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted-foreground w-44 shrink-0">Sync Status</span>
            <span :class="syncStatus.isSynced ? 'text-green-500' : 'text-yellow-500'" class="font-semibold">
              {{ syncStatus.isSynced ? 'Synced' : 'Syncing...' }}
            </span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted-foreground w-44 shrink-0">Network Hash Rate</span>
            <span class="font-mono">{{ hashRate !== null ? formatHashRate(hashRate) : '—' }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted-foreground w-44 shrink-0">Connected Peers</span>
            <span class="font-mono">{{ peers.length }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted-foreground w-44 shrink-0">Known Peers</span>
            <span class="font-mono">{{ peerAddresses?.known?.length ?? 0 }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted-foreground w-44 shrink-0">Banned Peers</span>
            <span class="font-mono">{{ peerAddresses?.banned?.length ?? 0 }}</span>
          </div>
        </CardContent>
      </Card>

      <Card v-if="peers.length > 0">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Connected Peers</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-for="peer in peers" :key="peer.id"
            class="rounded border border-border p-3 space-y-1 text-sm">
            <div class="flex gap-2">
              <span class="text-muted-foreground w-32 shrink-0">Address</span>
              <span class="font-mono">{{ peer.address }}</span>
            </div>
            <div class="flex gap-2">
              <span class="text-muted-foreground w-32 shrink-0">Direction</span>
              <span>{{ peer.isOutbound ? 'Outbound' : 'Inbound' }}</span>
            </div>
            <div class="flex gap-2">
              <span class="text-muted-foreground w-32 shrink-0">IBD Peer</span>
              <span>{{ peer.isIbdPeer ? 'Yes' : 'No' }}</span>
            </div>
            <div class="flex gap-2">
              <span class="text-muted-foreground w-32 shrink-0">User Agent</span>
              <span class="font-mono text-xs">{{ peer.userAgent }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>

    <CodeExample :code="EXAMPLE" title="useRpc — network stats" />
  </div>
</template>
