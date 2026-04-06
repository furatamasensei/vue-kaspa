<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRpc } from 'vue-kaspa'
import { RouterLink } from 'vue-router'

const rpc = useRpc()

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'
const connVariant: Record<string, BadgeVariant> = {
  disconnected: 'secondary',
  connecting: 'outline',
  connected: 'default',
  reconnecting: 'outline',
  error: 'destructive',
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">RPC API</h1>

    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge :variant="connVariant[rpc.connectionState.value] ?? 'secondary'">
          {{ rpc.connectionState.value }}
        </Badge>
      </CardContent>
    </Card>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <RouterLink v-for="item in [
        { label: 'Node Info', to: '/rpc/info' },
        { label: 'Get Block', to: '/rpc/block' },
        { label: 'Balance Checker', to: '/rpc/balance' },
        { label: 'Mempool Viewer', to: '/rpc/mempool' },
        { label: 'Fee Estimate', to: '/rpc/fees' },
        { label: 'Live Event Log', to: '/rpc/events' },
        { label: 'Block Listener', to: '/rpc/block-listener' },
        { label: 'Tx Listener', to: '/rpc/tx-listener' },
      ]" :key="item.to" :to="item.to"
        class="flex items-center justify-center rounded-lg border border-border bg-card px-4 py-5 text-sm font-medium text-card-foreground transition-colors hover:border-primary/50 hover:text-primary no-underline text-center">
        {{ item.label }}
      </RouterLink>
    </div>
  </div>
</template>
