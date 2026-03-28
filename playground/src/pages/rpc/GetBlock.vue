<script setup lang="ts">
import { ref } from 'vue'
import { useRpc, type BlockInfo } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const EXAMPLE = `import { useRpc } from 'vue-kaspa'

const rpc = useRpc()

const block = await rpc.getBlock(hash)
// block.hash           — hex string
// block.blueScore      — BigInt
// block.timestamp      — ms since epoch (number)
// block.transactions   — string[] of tx IDs`

const rpc = useRpc()
const hash = ref('')
const block = ref<BlockInfo | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

function fmtDate(ts: number): string {
  try {
    return new Date(Number(ts)).toISOString()
  } catch {
    return String(ts)
  }
}

async function fetch() {
  if (!hash.value.trim()) return
  loading.value = true
  error.value = null
  try {
    block.value = await rpc.getBlock(hash.value.trim())
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Get Block</h1>

    <Card>
      <CardContent class="pt-6 space-y-3">
        <div class="space-y-1">
          <label class="text-sm text-muted-foreground">Block Hash</label>
          <Input v-model="hash" placeholder="Enter block hash..." @keyup.enter="fetch" />
        </div>
        <Button :disabled="loading || !hash.trim()" @click="fetch">
          {{ loading ? 'Loading...' : 'Fetch getBlock()' }}
        </Button>
      </CardContent>
    </Card>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <Card v-if="block">
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Block</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        <div class="flex items-start gap-2">
          <span class="text-sm text-muted-foreground w-32 shrink-0">Hash</span>
          <span class="font-mono text-sm break-all">{{ block.hash }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground w-32">Blue Score</span>
          <span class="font-mono text-sm">{{ block.blueScore.toString() }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground w-32">Timestamp</span>
          <span class="text-sm">{{ fmtDate(block.timestamp) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground w-32">Transactions</span>
          <span class="text-sm">{{ block.transactions.length }}</span>
        </div>
      </CardContent>
    </Card>

    <CodeExample :code="EXAMPLE" title="useRpc — getBlock()" />
  </div>
</template>
