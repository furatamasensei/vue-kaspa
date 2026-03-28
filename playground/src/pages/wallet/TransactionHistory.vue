<script setup lang="ts">
import { ref } from 'vue'
import { useWallet, useCrypto, type TransactionPage } from 'vue-kaspa'

const wallet = useWallet()
const crypto = useCrypto()
const page = ref<TransactionPage | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  if (!wallet.activeAccount.value) { error.value = 'No active account'; return }
  loading.value = true
  error.value = null
  try {
    page.value = await wallet.getTransactions(wallet.activeAccount.value.id)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

const typeColor: Record<string, string> = {
  incoming: 'badge-green',
  outgoing: 'badge-red',
  'transfer-incoming': 'badge-green',
  'transfer-outgoing': 'badge-red',
  batch: 'badge-gray',
  reorg: 'badge-yellow',
}
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Transaction History</h1>
    <div class="card">
      <button class="btn btn-primary" :disabled="loading || !wallet.isOpen.value" @click="load">
        {{ loading ? 'Loading...' : 'Load Transactions' }}
      </button>
    </div>
    <div v-if="error" class="card" style="border-color:#ef4444"><p style="color:#f87171">{{ error }}</p></div>
    <div v-if="page">
      <div v-if="page.transactions.length === 0" class="card">
        <p style="color:#64748b">No transactions found.</p>
      </div>
      <div v-for="tx in page.transactions" :key="tx.id" class="card">
        <div class="row">
          <span class="mono" style="font-size:12px;color:#64748b">{{ tx.id }}</span>
          <span :class="['badge', typeColor[tx.type] ?? 'badge-gray']" style="margin-left:auto">{{ tx.type }}</span>
        </div>
        <div class="row" style="margin-top:4px">
          <span class="label">Value:</span>
          <span class="value mono" :style="{ color: tx.type === 'incoming' ? '#4ade80' : '#f87171' }">
            {{ ['incoming','transfer-incoming'].includes(tx.type) ? '+' : '-' }}{{ crypto.sompiToKaspaString(tx.value) }} KAS
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
