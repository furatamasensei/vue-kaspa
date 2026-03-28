<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWallet, useCrypto } from 'vue-kaspa'

const wallet = useWallet()
const crypto = useCrypto()

const toAddress = ref('')
const amountKas = ref('')
const password = ref('')
const txid = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const amountSompi = computed(() => {
  if (!amountKas.value) return 0n
  try { return crypto.kaspaToSompi(amountKas.value) } catch { return 0n }
})

const isValidAddr = computed(() =>
  toAddress.value ? crypto.isValidAddress(toAddress.value) : true,
)

async function send() {
  if (!wallet.activeAccount.value) { error.value = 'No active account'; return }
  loading.value = true
  error.value = null
  txid.value = null
  try {
    txid.value = await wallet.send({
      accountId: wallet.activeAccount.value.id,
      address: toAddress.value,
      amount: amountSompi.value,
      password: password.value,
    })
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Send KAS</h1>

    <div v-if="!wallet.isOpen.value" class="card">
      <p style="color:#64748b">Open your wallet first.</p>
    </div>

    <div v-else class="card">
      <div v-if="wallet.activeAccount.value" style="margin-bottom:16px;padding:12px;background:#0f172a;border-radius:6px">
        <div class="label">From Account</div>
        <div class="value">{{ wallet.activeAccount.value.name }}</div>
        <div class="mono" style="color:#70c7ba;font-size:12px">{{ wallet.activeAccount.value.receiveAddress }}</div>
      </div>

      <div class="label">To Address</div>
      <input
        v-model="toAddress"
        class="input"
        placeholder="kaspa:qr..."
        :style="{ borderColor: toAddress && !isValidAddr ? '#ef4444' : '' }"
      />
      <p v-if="toAddress && !isValidAddr" style="color:#f87171;font-size:12px;margin-bottom:8px">Invalid address</p>

      <div class="label">Amount (KAS)</div>
      <input v-model="amountKas" class="input" type="number" placeholder="0.00" step="0.001" />
      <div v-if="amountSompi > 0n" class="label" style="margin-top:-4px;margin-bottom:8px">
        = {{ amountSompi.toString() }} sompi
      </div>

      <div class="label">Wallet Password</div>
      <input v-model="password" class="input" type="password" placeholder="Password" />

      <button
        class="btn btn-primary"
        :disabled="loading || !toAddress || !amountKas || !password || !isValidAddr"
        @click="send"
      >{{ loading ? 'Sending...' : 'Send' }}</button>
    </div>

    <div v-if="txid" class="card" style="border-color:#22c55e">
      <p style="color:#4ade80;margin-bottom:8px">✓ Transaction submitted</p>
      <div class="label">Transaction ID</div>
      <div class="value mono">{{ txid }}</div>
    </div>

    <div v-if="error" class="card" style="border-color:#ef4444"><p style="color:#f87171">{{ error }}</p></div>
  </div>
</template>
