<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ref } from 'vue'
import { useRpc, type BlockDagInfo } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'

const EXAMPLE = `import { useRpc } from 'vue-kaspa'

const rpc = useRpc()

// Full DAG state
const dag = await rpc.getBlockDagInfo()
// dag.networkName       — 'kaspa-mainnet'
// dag.blockCount        — BigInt
// dag.tipHashes         — string[]
// dag.virtualDaaScore   — BigInt
// dag.pruningPointHash  — string

// Current sink (virtual selected parent)
const { sink } = await rpc.getSink()

// Sink blue score
const { sinkBlueScore } = await rpc.getSinkBlueScore()

// Virtual chain from a block hash
const chain = await rpc.getVirtualChainFromBlock(hash, false)
// chain.addedChainBlockHashes   — string[]
// chain.removedChainBlockHashes — string[]`

const rpc = useRpc()
const dagInfo = ref<BlockDagInfo | null>(null)
const sink = ref<string | null>(null)
const sinkBlueScore = ref<bigint | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function fetchAll() {
  loading.value = true
  error.value = null
  try {
    const [dag, sinkResult, scoreResult] = await Promise.all([
      rpc.getBlockDagInfo(),
      rpc.getSink(),
      rpc.getSinkBlueScore(),
    ])
    dagInfo.value = dag
    sink.value = sinkResult.sink
    sinkBlueScore.value = scoreResult.sinkBlueScore
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">DAG Info</h1>

    <Card>
      <CardContent class="pt-6">
        <Button :disabled="loading" @click="fetchAll">
          {{ loading ? 'Loading...' : 'Fetch DAG State' }}
        </Button>
      </CardContent>
    </Card>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <template v-if="dagInfo">
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Block DAG Info</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2 text-sm">
          <div class="flex gap-2">
            <span class="text-muted-foreground w-44 shrink-0">Network</span>
            <span class="font-mono">{{ dagInfo.networkName }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted-foreground w-44 shrink-0">Block Count</span>
            <span class="font-mono">{{ dagInfo.blockCount.toString() }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted-foreground w-44 shrink-0">Header Count</span>
            <span class="font-mono">{{ dagInfo.headerCount.toString() }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted-foreground w-44 shrink-0">Virtual DAA Score</span>
            <span class="font-mono">{{ dagInfo.virtualDaaScore.toString() }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted-foreground w-44 shrink-0">Difficulty</span>
            <span class="font-mono">{{ dagInfo.difficulty.toLocaleString() }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted-foreground w-44 shrink-0">Pruning Point</span>
            <span class="font-mono break-all">{{ dagInfo.pruningPointHash }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted-foreground w-44 shrink-0">Tip Hashes</span>
            <div class="font-mono break-all space-y-1">
              <div v-for="h in dagInfo.tipHashes" :key="h">{{ h }}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-base">Sink</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2 text-sm">
          <div class="flex gap-2">
            <span class="text-muted-foreground w-44 shrink-0">Sink Hash</span>
            <span class="font-mono break-all">{{ sink }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted-foreground w-44 shrink-0">Sink Blue Score</span>
            <span class="font-mono">{{ sinkBlueScore?.toString() }}</span>
          </div>
        </CardContent>
      </Card>
    </template>

    <CodeExample :code="EXAMPLE" title="useRpc — DAG state" />
  </div>
</template>
