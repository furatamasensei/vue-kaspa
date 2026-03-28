<script setup lang="ts">
import { ref } from 'vue'
import { useRpc, useCrypto, type FeeEstimate } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const EXAMPLE = `import { useRpc } from 'vue-kaspa'

const rpc = useRpc()

const estimate = await rpc.getFeeEstimate()
// estimate.priorityBucket.feerate        — sompi per gram
// estimate.priorityBucket.estimatedSeconds
// estimate.normalBuckets[]               — array of fee tiers
// estimate.lowBuckets[]

// Convert feerate → minimum fee for a standard tx (~2036 mass):
const minFeeSompi = Math.ceil(estimate.priorityBucket.feerate * 2036)`

const rpc = useRpc()
const crypto = useCrypto()
const estimate = ref<FeeEstimate | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

function fmtFee(feerate: number): string {
  const sompi = Math.ceil(feerate * 2036)
  const kas = crypto.sompiToKaspaString(BigInt(sompi))
  return `${sompi} sompi (${kas} KAS)`
}

async function fetch() {
  if (!rpc.isConnected.value) { error.value = 'Not connected'; return }
  loading.value = true
  error.value = null
  try {
    estimate.value = await rpc.getFeeEstimate()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Fee Estimate</h1>

    <Card>
      <CardContent class="pt-6">
        <Button :disabled="loading" @click="fetch">
          {{ loading ? 'Loading...' : 'Fetch getFeeEstimate()' }}
        </Button>
      </CardContent>
    </Card>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <template v-if="estimate">
      <!-- Priority bucket -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-base flex items-center gap-2">
            Priority
            <Badge variant="outline">~{{ estimate.priorityBucket.estimatedSeconds }}s</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground w-24">Feerate</span>
            <span class="font-mono text-sm">{{ estimate.priorityBucket.feerate }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground w-24">Min Fee</span>
            <span class="font-mono text-sm">{{ fmtFee(estimate.priorityBucket.feerate) }}</span>
          </div>
        </CardContent>
      </Card>

      <!-- Normal buckets -->
      <Card v-if="estimate.normalBuckets.length">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Normal Buckets</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-for="(b, i) in estimate.normalBuckets" :key="i" class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted-foreground w-6">{{ i + 1 }}</span>
              <span class="text-sm text-muted-foreground w-20">Feerate</span>
              <span class="font-mono text-sm">{{ b.feerate }}</span>
              <Badge variant="secondary" class="ml-auto text-xs">~{{ b.estimatedSeconds }}s</Badge>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted-foreground w-6"></span>
              <span class="text-sm text-muted-foreground w-20">Min Fee</span>
              <span class="font-mono text-sm">{{ fmtFee(b.feerate) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Low buckets -->
      <Card v-if="estimate.lowBuckets && estimate.lowBuckets.length">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Low Buckets</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-for="(b, i) in estimate.lowBuckets" :key="i" class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted-foreground w-6">{{ i + 1 }}</span>
              <span class="text-sm text-muted-foreground w-20">Feerate</span>
              <span class="font-mono text-sm">{{ b.feerate }}</span>
              <Badge variant="secondary" class="ml-auto text-xs">~{{ b.estimatedSeconds }}s</Badge>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted-foreground w-6"></span>
              <span class="text-sm text-muted-foreground w-20">Min Fee</span>
              <span class="font-mono text-sm">{{ fmtFee(b.feerate) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>

    <CodeExample :code="EXAMPLE" title="useRpc — getFeeEstimate()" />
  </div>
</template>
