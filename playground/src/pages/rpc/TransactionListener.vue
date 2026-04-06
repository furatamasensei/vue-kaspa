<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTransactionListener } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'

const EXAMPLE = `import { useTransactionListener } from 'vue-kaspa'

const { transactions, isListening, subscribe, unsubscribe, clear } = useTransactionListener({
  maxHistory: 100,      // keep last 100 tx IDs (default: 100)
  autoSubscribe: true,  // subscribe on mount (default: true)
})

// transactions.value — string[], most recent first
// Each entry is an accepted transaction ID

// Manual control (use autoSubscribe: false)
await subscribe()
await unsubscribe()
clear()`

const { transactions, isListening, subscribe, unsubscribe, clear } = useTransactionListener({
  autoSubscribe: false,
})
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Transaction Listener</h1>
    <p class="text-sm text-muted-foreground">
      Live feed of accepted transaction IDs via <code>useTransactionListener</code>.
      Uses the <code>virtual-chain-changed</code> subscription to capture confirmed transactions.
    </p>

    <Card>
      <CardContent class="pt-6">
        <div class="flex items-center gap-3">
          <Badge :variant="isListening ? 'default' : 'secondary'">
            {{ isListening ? 'Listening' : 'Stopped' }}
          </Badge>
          <Badge variant="outline">{{ transactions.length }} transactions</Badge>
          <Button v-if="!isListening" size="sm" @click="subscribe()">Start</Button>
          <Button v-else size="sm" variant="outline" @click="unsubscribe()">Stop</Button>
          <Button size="sm" variant="ghost" @click="clear()">Clear</Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Accepted Transactions</CardTitle>
      </CardHeader>
      <CardContent class="p-0">
        <ScrollArea class="h-[420px]">
          <div class="px-6 pb-4">
            <div v-if="transactions.length === 0" class="py-8 text-center text-sm text-muted-foreground">
              No transactions yet. Click Start to begin listening.
            </div>
            <div v-for="txId in transactions" :key="txId"
              class="py-2 border-b border-border/50 last:border-0">
              <div class="font-mono text-xs text-foreground break-all">{{ txId }}</div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>

    <CodeExample :code="EXAMPLE" title="useTransactionListener" />
  </div>
</template>
