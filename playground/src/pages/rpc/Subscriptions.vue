<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ref } from 'vue'
import { useRpc } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'

const EXAMPLE = `import { useRpc } from 'vue-kaspa'

const rpc = useRpc()

// Subscribe to DAA score changes
await rpc.subscribeDaaScore()
rpc.on('virtual-daa-score-changed', (e) => console.log(e.data))

// Subscribe to new blocks
await rpc.subscribeBlockAdded()
rpc.on('block-added', (e) => console.log(e.data))

// Subscribe to virtual chain changes (with accepted tx IDs)
await rpc.subscribeVirtualChainChanged(true)
rpc.on('virtual-chain-changed', (e) => console.log(e.data))

// Subscribe to sink blue score changes
await rpc.subscribeSinkBlueScoreChanged()
rpc.on('sink-blue-score-changed', (e) => console.log(e.data))

// Subscribe to new block templates (for miners)
await rpc.subscribeNewBlockTemplate()
rpc.on('new-block-template', (e) => console.log(e.data))

// Subscribe to UTXO changes for addresses
await rpc.subscribeUtxosChanged(['kaspa:qr...'])
rpc.on('utxos-changed', (e) => console.log(e.data))

// Unsubscribe when done
await rpc.unsubscribeBlockAdded()`

const rpc = useRpc()

interface SubEntry {
  label: string
  event: string
  active: boolean
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
}

const utxoAddresses = ref('')
const vcIncludeAccepted = ref(false)
const loading = ref<Record<string, boolean>>({})
const error = ref<string | null>(null)

const subscriptions = ref<SubEntry[]>([
  {
    label: 'DAA Score',
    event: 'virtual-daa-score-changed',
    active: false,
    subscribe: () => rpc.subscribeDaaScore(),
    unsubscribe: () => rpc.unsubscribeDaaScore(),
  },
  {
    label: 'Block Added',
    event: 'block-added',
    active: false,
    subscribe: () => rpc.subscribeBlockAdded(),
    unsubscribe: () => rpc.unsubscribeBlockAdded(),
  },
  {
    label: 'Sink Blue Score',
    event: 'sink-blue-score-changed',
    active: false,
    subscribe: () => rpc.subscribeSinkBlueScoreChanged(),
    unsubscribe: () => rpc.unsubscribeSinkBlueScoreChanged(),
  },
  {
    label: 'New Block Template',
    event: 'new-block-template',
    active: false,
    subscribe: () => rpc.subscribeNewBlockTemplate(),
    unsubscribe: () => rpc.unsubscribeNewBlockTemplate(),
  },
  {
    label: 'Finality Conflict',
    event: 'finality-conflict',
    active: false,
    subscribe: () => rpc.subscribeFinalityConflict(),
    unsubscribe: () => rpc.unsubscribeFinalityConflict(),
  },
  {
    label: 'Finality Conflict Resolved',
    event: 'finality-conflict-resolved',
    active: false,
    subscribe: () => rpc.subscribeFinalityConflictResolved(),
    unsubscribe: () => rpc.unsubscribeFinalityConflictResolved(),
  },
  {
    label: 'Pruning Point UTXO Override',
    event: 'pruning-point-utxo-set-override',
    active: false,
    subscribe: () => rpc.subscribePruningPointUtxoSetOverride(),
    unsubscribe: () => rpc.unsubscribePruningPointUtxoSetOverride(),
  },
])

async function toggle(sub: SubEntry) {
  loading.value[sub.label] = true
  error.value = null
  try {
    if (sub.active) {
      await sub.unsubscribe()
      sub.active = false
    } else {
      await sub.subscribe()
      sub.active = true
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value[sub.label] = false
  }
}

const vcActive = ref(false)
async function toggleVirtualChain() {
  loading.value['vc'] = true
  error.value = null
  try {
    if (vcActive.value) {
      await rpc.unsubscribeVirtualChainChanged(vcIncludeAccepted.value)
      vcActive.value = false
    } else {
      await rpc.subscribeVirtualChainChanged(vcIncludeAccepted.value)
      vcActive.value = true
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value['vc'] = false
  }
}

const utxoActive = ref(false)
async function toggleUtxos() {
  loading.value['utxo'] = true
  error.value = null
  try {
    const addresses = utxoAddresses.value.split(',').map((a) => a.trim()).filter(Boolean)
    if (!addresses.length) { error.value = 'Enter at least one address'; return }
    if (utxoActive.value) {
      await rpc.unsubscribeUtxosChanged(addresses)
      utxoActive.value = false
    } else {
      await rpc.subscribeUtxosChanged(addresses)
      utxoActive.value = true
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value['utxo'] = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Subscriptions</h1>
    <p class="text-sm text-muted-foreground">
      Manage node subscriptions. Events appear in the <RouterLink to="/rpc/events" class="underline">Event Log</RouterLink>.
    </p>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Simple Subscriptions</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        <div v-for="sub in subscriptions" :key="sub.label"
          class="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
          <div class="space-y-0.5">
            <div class="text-sm font-medium">{{ sub.label }}</div>
            <div class="font-mono text-xs text-muted-foreground">{{ sub.event }}</div>
          </div>
          <div class="flex items-center gap-3">
            <Badge :variant="sub.active ? 'default' : 'secondary'" class="text-xs">
              {{ sub.active ? 'Active' : 'Inactive' }}
            </Badge>
            <Button size="sm" :variant="sub.active ? 'outline' : 'default'"
              :disabled="loading[sub.label]" @click="toggle(sub)">
              {{ loading[sub.label] ? '...' : sub.active ? 'Unsubscribe' : 'Subscribe' }}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Virtual Chain Changed</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="vcIncludeAccepted" type="checkbox" class="accent-primary" :disabled="vcActive" />
          Include accepted transaction IDs
        </label>
        <div class="flex items-center gap-3">
          <Badge :variant="vcActive ? 'default' : 'secondary'" class="text-xs">
            {{ vcActive ? 'Active' : 'Inactive' }}
          </Badge>
          <Button size="sm" :variant="vcActive ? 'outline' : 'default'"
            :disabled="loading['vc']" @click="toggleVirtualChain()">
            {{ loading['vc'] ? '...' : vcActive ? 'Unsubscribe' : 'Subscribe' }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">UTXOs Changed</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="space-y-1">
          <label class="text-sm text-muted-foreground">Addresses (comma-separated)</label>
          <Input v-model="utxoAddresses" placeholder="kaspa:qr..., kaspa:qr..." :disabled="utxoActive" />
        </div>
        <div class="flex items-center gap-3">
          <Badge :variant="utxoActive ? 'default' : 'secondary'" class="text-xs">
            {{ utxoActive ? 'Active' : 'Inactive' }}
          </Badge>
          <Button size="sm" :variant="utxoActive ? 'outline' : 'default'"
            :disabled="loading['utxo']" @click="toggleUtxos()">
            {{ loading['utxo'] ? '...' : utxoActive ? 'Unsubscribe' : 'Subscribe' }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <CodeExample :code="EXAMPLE" title="useRpc — subscriptions" />
  </div>
</template>
