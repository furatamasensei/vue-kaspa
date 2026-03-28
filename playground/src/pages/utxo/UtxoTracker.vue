<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCrypto, useNetwork, useUtxo } from 'vkas'
import { computed, ref } from 'vue'
import CodeExample from '../../components/CodeExample.vue'

const network = useNetwork()
const utxo = useUtxo()
const crypto = useCrypto()

const EXAMPLE = computed(() => `import { useUtxo, useRpc } from 'vkas'

const utxo = useUtxo()

// Subscribe to UTXO changes + fetch initial entries
await utxo.track(['${network.isTestnet.value ? 'kaspatest' : 'kaspa'}:qr...'])

utxo.entries.value        // UtxoEntry[] — pass to useTransaction().create()
utxo.balance.value        // { mature: bigint, pending: bigint, outgoing: bigint }
utxo.trackedAddresses.value

// Re-fetch manually (also called on utxos-changed events)
await utxo.refresh()

// Stop tracking
await utxo.untrack(['${network.isTestnet.value ? 'kaspatest' : 'kaspa'}:qr...'])
await utxo.clear()          // untrack all`)

const addrInput = ref('')
const error = ref<string | null>(null)

async function track() {
  const addr = addrInput.value.trim()
  if (!addr) return
  error.value = null
  try {
    await utxo.track([addr])
    addrInput.value = ''
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

async function untrack(addr: string) {
  await utxo.untrack([addr]).catch(() => undefined)
}

async function refresh() {
  error.value = null
  try {
    await utxo.refresh()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

const totalBalance = computed(() => utxo.balance.value.mature + utxo.balance.value.pending)
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">UTXO Tracker</h1>

    <!-- Track address -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Track Address</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex gap-2">
          <Input v-model="addrInput" :placeholder="`${network.isTestnet.value ? 'kaspatest' : 'kaspa'}:qr...`"
            class="font-mono text-sm" @keyup.enter="track" />
          <Button :disabled="!addrInput.trim()" @click="track">Track</Button>
        </div>

        <div v-if="utxo.trackedAddresses.value.length" class="space-y-1">
          <p class="text-xs text-muted-foreground">Tracked addresses</p>
          <div v-for="addr in utxo.trackedAddresses.value" :key="addr"
            class="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-1.5">
            <span class="font-mono text-xs flex-1 truncate">{{ addr }}</span>
            <button class="text-xs text-muted-foreground hover:text-destructive" @click="untrack(addr)">remove</button>
          </div>
        </div>

        <Button v-if="utxo.isTracking.value" variant="secondary" size="sm" @click="refresh">Refresh</Button>
      </CardContent>
    </Card>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Balance -->
    <Card v-if="utxo.isTracking.value">
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Balance</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        <div class="flex items-center gap-3">
          <span class="text-3xl font-mono font-bold text-primary">
            {{ crypto.sompiToKaspaString(totalBalance) }}
          </span>
          <span class="text-muted-foreground">KAS</span>
        </div>
        <div class="flex gap-4 text-sm text-muted-foreground">
          <span>Mature: {{ crypto.sompiToKaspaString(utxo.balance.value.mature) }} KAS</span>
          <span v-if="utxo.balance.value.pending > 0n">
            Pending: {{ crypto.sompiToKaspaString(utxo.balance.value.pending) }} KAS
          </span>
        </div>
      </CardContent>
    </Card>

    <!-- UTXO list -->
    <Card v-if="utxo.entries.value.length">
      <CardHeader class="pb-2">
        <CardTitle class="text-base">
          {{ utxo.entries.value.length }} UTXO{{ utxo.entries.value.length !== 1 ? 's' : '' }}
        </CardTitle>
      </CardHeader>
      <CardContent class="p-0">
        <ScrollArea class="h-72">
          <div class="px-6 pb-4 space-y-0">
            <div v-for="(entry, i) in utxo.entries.value" :key="i"
              class="py-2.5 border-b border-border last:border-0 space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs text-primary">
                  {{ crypto.sompiToKaspaString(entry.amount) }} KAS
                </span>
                <Badge v-if="entry.isCoinbase" variant="outline" class="text-xs">coinbase</Badge>
                <span class="ml-auto font-mono text-xs text-muted-foreground">
                  {{ entry.outpoint.transactionId.slice(0, 12) }}…:{{ entry.outpoint.index }}
                </span>
              </div>
              <div v-if="entry.address" class="font-mono text-xs text-muted-foreground truncate">
                {{ entry.address }}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>

    <Card v-else-if="utxo.isTracking.value">
      <CardContent class="pt-6">
        <p class="text-sm text-muted-foreground">No UTXOs found for tracked addresses.</p>
      </CardContent>
    </Card>

    <CodeExample :code="EXAMPLE" title="useUtxo — reactive UTXO tracking" />
  </div>
</template>
