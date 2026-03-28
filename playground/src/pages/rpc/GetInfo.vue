<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ref } from 'vue'
import { useRpc, type ServerInfo } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'

const EXAMPLE = `import { useRpc } from 'vue-kaspa'

const rpc = useRpc()

const info = await rpc.getInfo()
// info.networkId       — 'mainnet' | 'testnet-10' | ...
// info.serverVersion   — e.g. '0.14.1'
// info.isSynced        — boolean
// info.isUtxoIndexEnabled — boolean`

const rpc = useRpc()
const info = ref<ServerInfo | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

function fmt(v: unknown): string {
  if (typeof v === 'bigint') return v.toString()
  return String(v)
}

async function fetch() {
  if (!rpc.isConnected.value) {
    error.value = 'Not connected. Go to Dashboard and connect first.'
    return
  }
  loading.value = true
  error.value = null
  try {
    info.value = await rpc.getInfo()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Node Info</h1>

    <Card>
      <CardContent class="pt-6">
        <Button :disabled="loading" @click="fetch">
          {{ loading ? 'Loading...' : 'Fetch getServerInfo()' }}
        </Button>
      </CardContent>
    </Card>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <Card v-if="info">
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Response</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground w-40">Network ID</span>
          <span class="text-sm">{{ fmt(info.networkId) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground w-40">Server Version</span>
          <span class="text-sm">{{ fmt(info.serverVersion) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground w-40">Synced</span>
          <Badge :variant="info.isSynced ? 'default' : 'outline'">{{ fmt(info.isSynced) }}</Badge>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground w-40">UTXO Index</span>
          <Badge :variant="info.isUtxoIndexEnabled ? 'default' : 'secondary'">{{ fmt(info.isUtxoIndexEnabled) }}</Badge>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground w-40">Has Notify Command</span>
          <Badge :variant="info.hasNotifyCommand ? 'default' : 'secondary'">{{ fmt(info.hasNotifyCommand) }}</Badge>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground w-40">Has Message ID</span>
          <Badge :variant="info.hasMessageId ? 'default' : 'secondary'">{{ fmt(info.hasMessageId) }}</Badge>
        </div>
      </CardContent>
    </Card>

    <CodeExample :code="EXAMPLE" title="useRpc — getInfo()" />
  </div>
</template>
