<script setup lang="ts">
import { ref } from 'vue'
import { useWallet } from 'vue-kaspa'
import { useRouter } from 'vue-router'

const wallet = useWallet()
const router = useRouter()
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function open() {
  if (!password.value) return
  loading.value = true
  error.value = null
  try {
    await wallet.open({ walletSecret: password.value })
    router.push('/wallet/accounts')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message + (e.cause ? ': ' + String(e.cause) : '') : String(e)
  } finally {
    loading.value = false
  }
}

async function close() {
  await wallet.close()
}
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Open Wallet</h1>
    <div v-if="wallet.isOpen.value" class="card" style="border-color:#22c55e">
      <p style="color:#4ade80;margin-bottom:12px">✓ Wallet is open</p>
      <button class="btn btn-secondary" @click="close">Close Wallet</button>
    </div>
    <div v-else class="card">
      <div class="label">Password</div>
      <input v-model="password" class="input" type="password" placeholder="Wallet password" @keyup.enter="open" />
      <button class="btn btn-primary" :disabled="loading || !password" @click="open">
        {{ loading ? 'Opening...' : 'Open Wallet' }}
      </button>
    </div>
    <div v-if="error" class="card" style="border-color:#ef4444"><p style="color:#f87171">{{ error }}</p></div>
  </div>
</template>
