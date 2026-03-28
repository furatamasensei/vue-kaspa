<script setup lang="ts">
import { ref } from 'vue'
import { useRpc, useCrypto, type MempoolEntry } from 'vue-kaspa'

const rpc = useRpc()
const crypto = useCrypto()
const entries = ref<MempoolEntry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function fetch() {
  if (!rpc.isConnected.value) { error.value = 'Not connected'; return }
  loading.value = true
  error.value = null
  try {
    entries.value = await rpc.getMempoolEntries()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Mempool Viewer</h1>
    <div class="card">
      <button class="btn btn-primary" :disabled="loading" @click="fetch">
        {{ loading ? 'Loading...' : 'Fetch getMempoolEntries()' }}
      </button>
    </div>
    <div v-if="error" class="card" style="border-color:#ef4444"><p style="color:#f87171">{{ error }}</p></div>
    <div v-if="entries.length" class="card">
      <h2>{{ entries.length }} entries{{ entries.length > 20 ? ' (showing first 20)' : '' }}</h2>
      <div v-for="(entry, i) in entries.slice(0, 20)" :key="i" style="padding:12px 0;border-bottom:1px solid #334155">
        <div class="row" style="margin-bottom:6px">
          <span class="label">TX ID:</span>
          <span class="mono" style="color:#94a3b8;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="entry.transaction.id">{{ entry.transaction.id }}</span>
        </div>
        <div class="row">
          <span class="label">Fee:</span>
          <span class="value mono">{{ entry.fee }} sompi ({{ crypto.sompiToKaspaString(entry.fee) }} KAS)</span>
        </div>
        <div class="row">
          <span class="label">Orphan:</span>
          <span :class="['badge', entry.isOrphan ? 'badge-yellow' : 'badge-gray']">{{ entry.isOrphan ? 'yes' : 'no' }}</span>
        </div>
        <div class="row">
          <span class="label">Inputs:</span>
          <span class="value">{{ entry.transaction.inputs.length }}</span>
          <span class="label" style="margin-left:16px">Outputs:</span>
          <span class="value">{{ entry.transaction.outputs.length }}</span>
        </div>
      </div>
      <div v-if="entries.length > 20" style="padding-top:8px;color:#64748b;font-size:13px">
        {{ entries.length - 20 }} more entries not shown.
      </div>
    </div>
    <div v-else-if="!loading && entries.length === 0 && !error" class="card">
      <p style="color:#64748b">No entries yet. Click fetch to load.</p>
    </div>
  </div>
</template>
