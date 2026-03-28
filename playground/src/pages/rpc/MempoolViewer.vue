<script setup lang="ts">
import { ref } from 'vue'
import { useRpc, useCrypto, type MempoolEntry } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'

const EXAMPLE = `import { useRpc } from 'vue-kaspa'

const rpc = useRpc()

const entries = await rpc.getMempoolEntries()
// entries[].transaction.id     — tx ID string
// entries[].fee                — BigInt sompi
// entries[].isOrphan           — boolean
// entries[].transaction.inputs / .outputs

// Filter by addresses
const mine = await rpc.getMempoolEntriesByAddresses(['kaspa:qr...'])`

const rpc = useRpc()
const crypto = useCrypto()
const entries = ref<MempoolEntry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function fetch() {
  if (!rpc.isConnected.value) { error.value = 'Not connected'; return }
  loading.value = true
  error.value = null
  try {
    entries.value = await rpc.getMempoolEntries()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Mempool Viewer</h1>

    <Card>
      <CardContent class="pt-6">
        <Button :disabled="loading" @click="fetch">
          {{ loading ? 'Loading...' : 'Fetch getMempoolEntries()' }}
        </Button>
      </CardContent>
    </Card>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <Card v-if="entries.length">
      <CardHeader class="pb-2">
        <CardTitle class="text-base">
          {{ entries.length }} entries{{ entries.length > 20 ? ' (showing first 20)' : '' }}
        </CardTitle>
      </CardHeader>
      <CardContent class="p-0">
        <ScrollArea class="h-[480px]">
          <div class="px-6 pb-4 space-y-0">
            <div
              v-for="(entry, i) in entries.slice(0, 20)"
              :key="i"
              class="py-3 border-b border-border last:border-0 space-y-1.5"
            >
              <div class="flex items-center gap-2">
                <span class="text-xs text-muted-foreground shrink-0">TX ID</span>
                <span class="font-mono text-xs text-muted-foreground truncate" :title="entry.transaction.id">
                  {{ entry.transaction.id }}
                </span>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted-foreground">Fee</span>
                  <span class="font-mono text-xs">{{ entry.fee }} sompi ({{ crypto.sompiToKaspaString(entry.fee) }} KAS)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted-foreground">Orphan</span>
                  <Badge :variant="entry.isOrphan ? 'outline' : 'secondary'" class="text-xs">
                    {{ entry.isOrphan ? 'yes' : 'no' }}
                  </Badge>
                </div>
                <div class="flex items-center gap-2 ml-auto">
                  <span class="text-xs text-muted-foreground">In: {{ entry.transaction.inputs.length }}</span>
                  <span class="text-xs text-muted-foreground">Out: {{ entry.transaction.outputs.length }}</span>
                </div>
              </div>
            </div>
            <p v-if="entries.length > 20" class="pt-2 text-sm text-muted-foreground">
              {{ entries.length - 20 }} more entries not shown.
            </p>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>

    <Card v-else-if="!loading && entries.length === 0 && !error">
      <CardContent class="pt-6">
        <p class="text-sm text-muted-foreground">No entries yet. Click fetch to load.</p>
      </CardContent>
    </Card>

    <CodeExample :code="EXAMPLE" title="useRpc — getMempoolEntries()" />
  </div>
</template>
