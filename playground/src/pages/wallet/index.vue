<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useWallet } from 'vue-kaspa'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const wallet = useWallet()

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'
const walletVariant: Record<string, BadgeVariant> = {
  open: 'default',
  opening: 'outline',
  closed: 'secondary',
  uninitialized: 'secondary',
  error: 'destructive',
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Wallet API</h1>

    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge :variant="walletVariant[wallet.walletStatus.value] ?? 'secondary'">
          {{ wallet.walletStatus.value }}
        </Badge>
      </CardContent>
    </Card>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <RouterLink
        v-for="item in [
          { label: 'Create Wallet', to: '/wallet/create' },
          { label: 'Open Wallet', to: '/wallet/open' },
          { label: 'Accounts', to: '/wallet/accounts' },
          { label: 'Send', to: '/wallet/send' },
          { label: 'History', to: '/wallet/history' },
        ]"
        :key="item.to"
        :to="item.to"
        class="flex items-center justify-center rounded-lg border border-border bg-card px-4 py-5 text-sm font-medium text-card-foreground transition-colors hover:border-primary/50 hover:text-primary no-underline text-center"
      >
        {{ item.label }}
      </RouterLink>
    </div>
  </div>
</template>
