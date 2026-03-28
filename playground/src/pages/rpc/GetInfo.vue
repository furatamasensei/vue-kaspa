<script setup lang="ts">
import { ref } from 'vue'
import { useRpc, type ServerInfo } from 'vue-kaspa'

const rpc = useRpc()
const info = ref<ServerInfo | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

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
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Node Info</h1>

    <div class="card">
      <button class="btn btn-primary" :disabled="loading" @click="fetch">
        {{ loading ? 'Loading...' : 'Fetch getServerInfo()' }}
      </button>
    </div>

    <div v-if="error" class="card" style="border-color:#ef4444">
      <p style="color:#f87171">{{ error }}</p>
    </div>

    <div v-if="info" class="card">
      <h2>Response</h2>
      <div class="row"><span class="label">Network ID:</span><span class="value">{{ info.networkId }}</span></div>
      <div class="row"><span class="label">Server Version:</span><span class="value">{{ info.serverVersion }}</span></div>
      <div class="row">
        <span class="label">Synced:</span>
        <span :class="['badge', info.isSynced ? 'badge-green' : 'badge-yellow']">{{ info.isSynced }}</span>
      </div>
      <div class="row">
        <span class="label">UTXO Index:</span>
        <span :class="['badge', info.isUtxoIndexEnabled ? 'badge-green' : 'badge-gray']">{{ info.isUtxoIndexEnabled }}</span>
      </div>
    </div>
  </div>
</template>
