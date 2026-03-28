<script setup lang="ts">
import { ref } from 'vue'
import { useRpc, type BlockInfo } from 'vue-kaspa'

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
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Get Block</h1>
    <div class="card">
      <div class="label">Block Hash</div>
      <input v-model="hash" class="input" placeholder="Enter block hash..." @keyup.enter="fetch" />
      <button class="btn btn-primary" :disabled="loading || !hash.trim()" @click="fetch">
        {{ loading ? 'Loading...' : 'Fetch getBlock()' }}
      </button>
    </div>
    <div v-if="error" class="card" style="border-color:#ef4444">
      <p style="color:#f87171">{{ error }}</p>
    </div>
    <div v-if="block" class="card">
      <h2>Block</h2>
      <div class="row"><span class="label">Hash:</span><span class="value mono">{{ block.hash }}</span></div>
      <div class="row"><span class="label">Blue Score:</span><span class="value mono">{{ block.blueScore.toString() }}</span></div>
      <div class="row"><span class="label">Timestamp:</span><span class="value">{{ fmtDate(block.timestamp) }}</span></div>
      <div class="row"><span class="label">Transactions:</span><span class="value">{{ block.transactions.length }}</span></div>
    </div>
  </div>
</template>
