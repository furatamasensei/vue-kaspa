<script setup lang="ts">
import { ref } from 'vue'
import { useWallet, useCrypto, type TransactionPage } from 'vue-kaspa'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const wallet = useWallet()
const crypto = useCrypto()
const page = ref<TransactionPage | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  if (!wallet.activeAccount.value) { error.value = 'No active account'; return }
  loading.value = true
  error.value = null
  try {
    page.value = await wallet.getTransactions(wallet.activeAccount.value.id)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'
const typeVariant: Record<string, BadgeVariant> = {
  incoming: 'default',
  outgoing: 'destructive',
  'transfer-incoming': 'default',
  'transfer-outgoing': 'destructive',
  batch: 'secondary',
  reorg: 'outline',
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Transaction History</h1>

    <Card>
      <CardContent class="pt-6">
        <Button :disabled="loading || !wallet.isOpen.value" @click="load">
          {{ loading ? 'Loading...' : 'Load Transactions' }}
        </Button>
      </CardContent>
    </Card>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <template v-if="page">
      <Card v-if="page.transactions.length === 0">
        <CardContent class="pt-6">
          <p class="text-sm text-muted-foreground">No transactions found.</p>
        </CardContent>
      </Card>

      <Card v-for="tx in page.transactions" :key="tx.id">
        <CardContent class="pt-4 space-y-1.5">
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs text-muted-foreground truncate flex-1">{{ tx.id }}</span>
            <Badge :variant="typeVariant[tx.type] ?? 'secondary'">{{ tx.type }}</Badge>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Value</span>
            <span
              class="font-mono text-sm"
              :class="['incoming', 'transfer-incoming'].includes(tx.type) ? 'text-green-400' : 'text-destructive'"
            >
              {{ ['incoming', 'transfer-incoming'].includes(tx.type) ? '+' : '-' }}{{ crypto.sompiToKaspaString(tx.value) }} KAS
            </span>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
