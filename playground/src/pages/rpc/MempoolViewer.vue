<script setup lang="ts">
import { ref } from 'vue'
import { useRpc, type MempoolEntry } from 'vue-kaspa'

const rpc = useRpc()
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
      <h2>{{ entries.length }} entries</h2>
      <div v-for="(entry, i) in entries.slice(0, 20)" :key="i" style="padding:8px 0;border-bottom:1px solid #334155">
        <span class="mono" style="color:#94a3b8">{{ entry.transaction.id }}</span>
        <span class="badge badge-gray" style="margin-left:8px">fee: {{ entry.fee }}</span>
      </div>
    </div>
    <div v-else-if="!loading && entries.length === 0 && !error" class="card">
      <p style="color:#64748b">No entries yet. Click fetch to load.</p>
    </div>
  </div>
</template>
