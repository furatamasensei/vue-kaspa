<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ref } from 'vue'
import { useRpc } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'

const EXAMPLE = `import { useRpc } from 'vue-kaspa'

const rpc = useRpc()

const block = await rpc.getBlocks()
// block.hash           — hex string
// block.blueScore      — BigInt
// block.timestamp      — ms since epoch (number)
// block.transactions   — string[] of tx IDs`

const rpc = useRpc()
const block = ref<any>(null)
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
  loading.value = true
  error.value = null
  try {
    block.value = await rpc.getBlocks()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Get Blocks</h1>

    <Card>
      <CardContent class="pt-6 space-y-3">
        <Button :disabled="loading" @click="fetch">
          {{ loading ? 'Loading...' : 'Fetch getBlocks()' }}
        </Button>
      </CardContent>
    </Card>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <Card v-if="block">
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Blocks</CardTitle>
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

    <CodeExample :code="EXAMPLE" title="useRpc — getBlocks()" />
  </div>
</template>
