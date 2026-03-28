<script setup lang="ts">
import { ref } from 'vue'
import { useRpc, type FeeEstimate } from 'vue-kaspa'

const rpc = useRpc()
const estimate = ref<FeeEstimate | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

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
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Fee Estimate</h1>
    <div class="card">
      <button class="btn btn-primary" :disabled="loading" @click="fetch">
        {{ loading ? 'Loading...' : 'Fetch getFeeEstimate()' }}
      </button>
    </div>
    <div v-if="error" class="card" style="border-color:#ef4444"><p style="color:#f87171">{{ error }}</p></div>
    <div v-if="estimate" class="card">
      <h2>Fee Estimate</h2>
      <div style="margin-bottom:12px">
        <div class="label" style="color:#fbbf24;margin-bottom:4px">Priority</div>
        <div class="row">
          <span class="label">Feerate:</span>
          <span class="value mono">{{ estimate.priorityBucket.feerate }}</span>
          <span class="badge badge-yellow" style="margin-left:auto">~{{ estimate.priorityBucket.estimatedSeconds }}s</span>
        </div>
      </div>
      <div v-if="estimate.normalBuckets.length">
        <div class="label" style="margin-bottom:4px">Normal Buckets</div>
        <div v-for="(b, i) in estimate.normalBuckets" :key="i" class="row">
          <span class="label">{{ i + 1 }}:</span>
          <span class="value mono">{{ b.feerate }}</span>
          <span class="badge badge-gray" style="margin-left:auto">~{{ b.estimatedSeconds }}s</span>
        </div>
      </div>
    </div>
  </div>
</template>
