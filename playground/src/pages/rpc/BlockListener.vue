<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useBlockListener } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'

const EXAMPLE = `import { useBlockListener } from 'vue-kaspa'

const { blocks, isListening, subscribe, unsubscribe, clear } = useBlockListener({
  maxHistory: 50,       // keep last 50 blocks (default: 100)
  autoSubscribe: true,  // subscribe on mount (default: true)
})

// blocks.value — BlockInfo[], most recent first
// { hash, timestamp, blueScore, transactions: string[] }

// Manual control (use autoSubscribe: false)
await subscribe()
await unsubscribe()
clear()`

const { blocks, isListening, subscribe, unsubscribe, clear } = useBlockListener({
  autoSubscribe: false,
  maxHistory: 50,
})

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString()
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Block Listener</h1>
    <p class="text-sm text-muted-foreground">
      Live feed of new blocks added to the DAG via <code>useBlockListener</code>.
    </p>

    <Card>
      <CardContent class="pt-6">
        <div class="flex items-center gap-3">
          <Badge :variant="isListening ? 'default' : 'secondary'">
            {{ isListening ? 'Listening' : 'Stopped' }}
          </Badge>
          <Badge variant="outline">{{ blocks.length }} blocks</Badge>
          <Button v-if="!isListening" size="sm" @click="subscribe()">Start</Button>
          <Button v-else size="sm" variant="outline" @click="unsubscribe()">Stop</Button>
          <Button size="sm" variant="ghost" @click="clear()">Clear</Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Blocks</CardTitle>
      </CardHeader>
      <CardContent class="p-0">
        <ScrollArea class="h-[420px]">
          <div class="px-6 pb-4">
            <div v-if="blocks.length === 0" class="py-8 text-center text-sm text-muted-foreground">
              No blocks yet. Click Start to begin listening.
            </div>
            <div v-for="block in blocks" :key="block.hash"
              class="py-2 border-b border-border/50 last:border-0 space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs text-muted-foreground">{{ formatTime(block.timestamp) }}</span>
                <Badge variant="secondary" class="text-xs">score {{ block.blueScore.toString() }}</Badge>
                <Badge variant="outline" class="text-xs">{{ block.transactions.length }} txs</Badge>
              </div>
              <div class="font-mono text-xs text-foreground truncate">{{ block.hash }}</div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>

    <CodeExample :code="EXAMPLE" title="useBlockListener" />
  </div>
</template>
