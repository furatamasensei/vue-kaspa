<script setup lang="ts">
import { useWallet, useCrypto } from 'vue-kaspa'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const wallet = useWallet()
const crypto = useCrypto()

function formatBalance(sompi: bigint) {
  return crypto.sompiToKaspaString(sompi)
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Accounts</h1>

    <Card v-if="!wallet.isOpen.value">
      <CardContent class="pt-6">
        <p class="text-sm text-muted-foreground">
          Wallet is not open.
          <a href="#/wallet/open" class="text-primary underline-offset-2 hover:underline">Open wallet</a>
        </p>
      </CardContent>
    </Card>

    <template v-else>
      <Card v-if="wallet.accounts.value.length === 0">
        <CardContent class="pt-6">
          <p class="text-sm text-muted-foreground">No accounts found.</p>
        </CardContent>
      </Card>

      <Card
        v-for="account in wallet.accounts.value"
        :key="account.id"
        class="cursor-pointer transition-colors"
        :class="wallet.activeAccount.value?.id === account.id ? 'border-primary/50' : 'hover:border-muted-foreground/30'"
        @click="wallet.setActiveAccount(account.id)"
      >
        <CardHeader class="pb-2">
          <CardTitle class="text-base flex items-center justify-between">
            <span>{{ account.name }}</span>
            <Badge v-if="wallet.activeAccount.value?.id === account.id" variant="default">Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div>
            <p class="text-xs text-muted-foreground mb-1">Receive Address</p>
            <p class="font-mono text-sm text-primary break-all">{{ account.receiveAddress }}</p>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <p class="text-xs text-muted-foreground mb-1">Mature</p>
              <p class="font-mono text-sm">{{ formatBalance(account.balance.mature) }} KAS</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">Pending</p>
              <p class="font-mono text-sm">{{ formatBalance(account.balance.pending) }} KAS</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">Outgoing</p>
              <p class="font-mono text-sm">{{ formatBalance(account.balance.outgoing) }} KAS</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
