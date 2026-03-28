<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRpc, type RpcEventType } from 'vkas'
import { computed, ref } from 'vue'
import CodeExample from '../../components/CodeExample.vue'

const EXAMPLE = `import { useRpc } from 'vkas'

const rpc = useRpc()

// Reactive accumulated log (persists across navigations)
rpc.eventLog.value  // RpcEvent[]  { type, data, timestamp }

// Subscribe to a specific event
rpc.on('block-added', (event) => {
  console.log(event.type, event.data)
})

// Available events:
// 'block-added' | 'virtual-chain-changed' | 'utxos-changed'
// 'virtual-daa-score-changed' | 'sink-blue-score-changed'
// 'new-block-template' | 'finality-conflict'
// 'connect' | 'disconnect'

rpc.clearEventLog()  // wipe the log`

const rpc = useRpc()
const filter = ref<RpcEventType | 'all'>('all')
const allTypes: Array<RpcEventType | 'all'> = [
  'all', 'block-added', 'virtual-chain-changed', 'utxos-changed',
  'finality-conflict', 'sink-blue-score-changed', 'virtual-daa-score-changed',
  'new-block-template', 'connect', 'disconnect',
]

const filtered = computed(() =>
  filter.value === 'all'
    ? rpc.eventLog.value
    : rpc.eventLog.value.filter(e => e.type === filter.value)
)

const destructiveTypes = new Set(['finality-conflict', 'disconnect'])
const defaultTypes = new Set(['block-added', 'connect'])

function variantFor(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (destructiveTypes.has(type)) return 'destructive'
  if (defaultTypes.has(type)) return 'default'
  return 'secondary'
}

function safeJson(v: unknown): string {
  try {
    return JSON.stringify(v, (_, val) => typeof val === 'bigint' ? val.toString() + 'n' : val, 2)
  } catch {
    return String(v)
  }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Live Event Log</h1>

    <Card>
      <CardContent class="pt-6">
        <div class="flex flex-wrap gap-2 items-center">
          <span class="text-sm text-muted-foreground">Filter:</span>
          <Button v-for="t in allTypes" :key="t" :variant="filter === t ? 'default' : 'secondary'" size="sm"
            class="text-xs h-7" @click="filter = t">{{ t }}</Button>
          <Button variant="outline" size="sm" class="ml-auto text-xs h-7" @click="rpc.clearEventLog()">
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Events ({{ filtered.length }})</CardTitle>
      </CardHeader>
      <CardContent class="p-0">
        <ScrollArea class="h-[480px]">
          <div class="px-6 pb-4">
            <div v-if="filtered.length === 0" class="py-8 text-center text-sm text-muted-foreground">
              No events yet. Connect to a node and subscribe to see live events.
            </div>
            <div v-for="(event, i) in filtered.slice().reverse().slice(0, 100)" :key="i"
              class="flex gap-3 items-start py-2 border-b border-border/50 last:border-0">
              <span class="font-mono text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                {{ new Date(event.timestamp).toLocaleTimeString() }}
              </span>
              <Badge :variant="variantFor(event.type)" class="shrink-0 text-xs">{{ event.type }}</Badge>
              <pre
                class="font-mono text-xs text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap max-w-xs">{{ safeJson(event.data) }}</pre>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>

    <CodeExample :code="EXAMPLE" title="useRpc — event log & subscriptions" />
  </div>
</template>
