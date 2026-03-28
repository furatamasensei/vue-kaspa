<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRpc, useCrypto, useNetwork } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const rpc = useRpc()
const crypto = useCrypto()
const network = useNetwork()

const addrPrefix = computed(() => network.isTestnet.value ? 'kaspatest' : 'kaspa')

const EXAMPLE = computed(() => `import { useRpc, useCrypto } from 'vue-kaspa'

const rpc = useRpc()
const crypto = useCrypto()

const { balance } = await rpc.getBalanceByAddress('${addrPrefix.value}:qr...')
console.log(crypto.sompiToKaspaString(balance), 'KAS')

// Batch multiple addresses
const results = await rpc.getBalancesByAddresses(['${addrPrefix.value}:qr...', '${addrPrefix.value}:qq...'])
// results[].address, results[].balance (BigInt sompi)`)
const address = ref('')
const balance = ref<bigint | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function check() {
  const addr = address.value.trim()
  if (!addr) return
  if (!rpc.isConnected.value) { error.value = 'Not connected'; return }
  loading.value = true
  error.value = null
  try {
    const result = await rpc.getBalanceByAddress(addr)
    balance.value = result.balance
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Balance Checker</h1>

    <Card>
      <CardContent class="pt-6 space-y-3">
        <div class="space-y-1">
          <label class="text-sm text-muted-foreground">Kaspa Address</label>
          <Input v-model="address" :placeholder="`${addrPrefix}:qr...`" @keyup.enter="check" />
        </div>
        <Button :disabled="loading || !address.trim()" @click="check">
          {{ loading ? 'Checking...' : 'Get Balance' }}
        </Button>
      </CardContent>
    </Card>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <Card v-if="balance !== null">
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Balance</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div>
          <p class="text-sm text-muted-foreground mb-1">KAS</p>
          <p class="font-mono text-2xl text-primary">{{ crypto.sompiToKaspaString(balance) }}</p>
        </div>
        <div>
          <p class="text-sm text-muted-foreground mb-1">Sompi</p>
          <p class="font-mono text-sm">{{ balance.toString() }}</p>
        </div>
      </CardContent>
    </Card>

    <CodeExample :code="EXAMPLE" title="useRpc — getBalanceByAddress()" />
  </div>
</template>
