<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWallet, useCrypto } from 'vue-kaspa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Send KAS</h1>

    <Card v-if="!wallet.isOpen.value">
      <CardContent class="pt-6">
        <p class="text-sm text-muted-foreground">Open your wallet first.</p>
      </CardContent>
    </Card>

    <Card v-else>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Send Transaction</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div v-if="wallet.activeAccount.value" class="rounded-md bg-muted/40 px-3 py-2 space-y-0.5">
          <p class="text-xs text-muted-foreground">From Account</p>
          <p class="text-sm font-medium">{{ wallet.activeAccount.value.name }}</p>
          <p class="font-mono text-xs text-primary">{{ wallet.activeAccount.value.receiveAddress }}</p>
        </div>

        <div class="space-y-1">
          <label class="text-sm text-muted-foreground">To Address</label>
          <Input
            v-model="toAddress"
            placeholder="kaspa:qr..."
            :class="toAddress && !isValidAddr ? 'border-destructive' : ''"
          />
          <p v-if="toAddress && !isValidAddr" class="text-xs text-destructive">Invalid address</p>
        </div>

        <div class="space-y-1">
          <label class="text-sm text-muted-foreground">Amount (KAS)</label>
          <Input v-model="amountKas" type="number" placeholder="0.00" step="0.001" />
          <p v-if="amountSompi > 0n" class="text-xs text-muted-foreground">= {{ amountSompi.toString() }} sompi</p>
        </div>

        <div class="space-y-1">
          <label class="text-sm text-muted-foreground">Wallet Password</label>
          <Input v-model="password" type="password" placeholder="Password" />
        </div>

        <Button
          :disabled="loading || !toAddress || !amountKas || !password || !isValidAddr"
          @click="send"
        >{{ loading ? 'Sending...' : 'Send' }}</Button>
      </CardContent>
    </Card>

    <Alert v-if="txid" class="border-green-600/40 text-green-400 bg-green-950/20">
      <AlertDescription>
        <p class="mb-1">Transaction submitted</p>
        <p class="text-xs text-muted-foreground mb-0.5">Transaction ID</p>
        <p class="font-mono text-xs break-all">{{ txid }}</p>
      </AlertDescription>
    </Alert>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>
  </div>
</template>
