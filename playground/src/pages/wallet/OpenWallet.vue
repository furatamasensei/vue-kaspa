<script setup lang="ts">
import { ref } from 'vue'
import { useWallet } from 'vue-kaspa'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Open Wallet</h1>

    <Card v-if="wallet.isOpen.value">
      <CardContent class="pt-6 space-y-3">
        <p class="text-sm text-green-400">Wallet is open</p>
        <Button variant="secondary" @click="close">Close Wallet</Button>
      </CardContent>
    </Card>

    <Card v-else>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Unlock Wallet</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="space-y-1">
          <label class="text-sm text-muted-foreground">Password</label>
          <Input v-model="password" type="password" placeholder="Wallet password" @keyup.enter="open" />
        </div>
        <Button :disabled="loading || !password" @click="open">
          {{ loading ? 'Opening...' : 'Open Wallet' }}
        </Button>
      </CardContent>
    </Card>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>
  </div>
</template>
