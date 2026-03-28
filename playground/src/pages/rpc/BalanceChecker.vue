<script setup lang="ts">
import { ref } from 'vue'
import { useRpc, useCrypto } from 'vue-kaspa'

const rpc = useRpc()
const crypto = useCrypto()
const address = ref('')
const balance = ref<bigint | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function check() {
  const addr = address.value.trim()
  if (!addr) return
  if (!rpc.isConnected.value) { error.value = 'Not connected'; return }
  loading.value = true
  error.value = null
  try {
    const result = await rpc.getBalanceByAddress(addr)
    balance.value = result.balance
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Balance Checker</h1>
    <div class="card">
      <div class="label">Kaspa Address</div>
      <input v-model="address" class="input" placeholder="kaspa:qr..." @keyup.enter="check" />
      <button class="btn btn-primary" :disabled="loading || !address.trim()" @click="check">
        {{ loading ? 'Checking...' : 'Get Balance' }}
      </button>
    </div>
    <div v-if="error" class="card" style="border-color:#ef4444">
      <p style="color:#f87171">{{ error }}</p>
    </div>
    <div v-if="balance !== null" class="card">
      <h2>Balance</h2>
      <div class="row">
        <span class="label">KAS:</span>
        <span class="value mono" style="font-size:20px;color:#70c7ba">
          {{ crypto.sompiToKaspaString(balance) }}
        </span>
      </div>
      <div class="row">
        <span class="label">Sompi:</span>
        <span class="value mono">{{ balance.toString() }}</span>
      </div>
    </div>
  </div>
</template>
