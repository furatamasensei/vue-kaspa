<script setup lang="ts">
import { ref } from 'vue'
import { useWallet } from 'vue-kaspa'

const wallet = useWallet()
const password = ref('')
const walletName = ref('my-wallet')
const created = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

async function create() {
  if (!password.value) return
  loading.value = true
  error.value = null
  try {
    await wallet.create({ walletSecret: password.value, walletName: walletName.value })
    created.value = true
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Create Wallet</h1>
    <div v-if="created" class="card" style="border-color:#22c55e">
      <p style="color:#4ade80">✓ Wallet created successfully. Go to Open Wallet to access it.</p>
    </div>
    <div v-else class="card">
      <div class="label">Wallet Name</div>
      <input v-model="walletName" class="input" placeholder="my-wallet" />
      <div class="label">Password</div>
      <input v-model="password" class="input" type="password" placeholder="Enter a strong password" />
      <button class="btn btn-primary" :disabled="loading || !password" @click="create">
        {{ loading ? 'Creating...' : 'Create Wallet' }}
      </button>
    </div>
    <div v-if="error" class="card" style="border-color:#ef4444">
      <p style="color:#f87171">{{ error }}</p>
    </div>
  </div>
</template>
