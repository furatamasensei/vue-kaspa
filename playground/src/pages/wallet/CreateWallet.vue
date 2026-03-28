<script setup lang="ts">
import { ref } from 'vue'
import { useWallet } from 'vue-kaspa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Create Wallet</h1>

    <Alert v-if="created" class="border-green-600/40 text-green-400 bg-green-950/20">
      <AlertDescription>Wallet created successfully. Go to Open Wallet to access it.</AlertDescription>
    </Alert>

    <Card v-else>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">New Wallet</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="space-y-1">
          <label class="text-sm text-muted-foreground">Wallet Name</label>
          <Input v-model="walletName" placeholder="my-wallet" />
        </div>
        <div class="space-y-1">
          <label class="text-sm text-muted-foreground">Password</label>
          <Input v-model="password" type="password" placeholder="Enter a strong password" />
        </div>
        <Button :disabled="loading || !password" @click="create">
          {{ loading ? 'Creating...' : 'Create Wallet' }}
        </Button>
      </CardContent>
    </Card>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>
  </div>
</template>
