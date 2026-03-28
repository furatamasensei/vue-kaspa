<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { computed, ref } from 'vue'
import type { PendingTx, TransactionSummary } from 'vue-kaspa'
import { useCrypto, useNetwork, useTransaction, useUtxo } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'

const network = useNetwork()
const utxo = useUtxo()
const tx = useTransaction()
const crypto = useCrypto()

const addrPrefix = computed(() => network.isTestnet.value ? 'kaspatest' : 'kaspa')

const EXAMPLE = computed(() => `import { useUtxo, useTransaction } from 'vue-kaspa'

const utxo = useUtxo()
const tx = useTransaction()

// 1. Track your address to load UTXOs
await utxo.track(['${addrPrefix.value}:qr...'])

// 2. Estimate fees first
const summary = await tx.estimate({
  entries: utxo.entries.value,
  outputs: [{ address: '${addrPrefix.value}:qdest...', amount: 1_000_000_000n }],
  changeAddress: '${addrPrefix.value}:qchange...',
  priorityFee: 1000n,
  networkId: '${network.currentNetwork.value}',
})
// summary.fees, summary.mass, summary.transactions

// 3a. One-shot: build + sign + submit
const txIds = await tx.send({
  entries: utxo.entries.value,
  outputs: [{ address: '${addrPrefix.value}:qdest...', amount: 1_000_000_000n }],
  changeAddress: '${addrPrefix.value}:qchange...',
  priorityFee: 1000n,
  networkId: '${network.currentNetwork.value}',
  privateKeys: ['your-private-key-hex'],
})

// 3b. Manual: build → sign → submit separately (for hardware wallets, multisig, etc.)
const { transactions, summary } = await tx.create({ ... })
for (const pending of transactions) {
  pending.sign(['private-key-hex'])       // or sign via hardware wallet
  const txId = await pending.submit()
}`)

// Track tab
const trackAddr = ref('')
const trackError = ref<string | null>(null)

async function track() {
  const a = trackAddr.value.trim()
  if (!a) return
  trackError.value = null
  try {
    await utxo.track([a])
    trackAddr.value = ''
  } catch (e: unknown) {
    trackError.value = e instanceof Error ? e.message : String(e)
  }
}

// Build tab
const toAddress = ref('')
const changeAddress = ref('')
const amountKas = ref('')
const priorityFee = ref('1000')
const privateKey = ref('')

const loading = ref(false)
const error = ref<string | null>(null)
const estimate = ref<TransactionSummary | null>(null)
const pendingTxs = ref<PendingTx[]>([])
const submittedIds = ref<string[]>([])

const amountSompi = computed(() => {
  try { return crypto.kaspaToSompi(amountKas.value) } catch { return null }
})

async function runEstimate() {
  if (!amountSompi.value || !toAddress.value || !changeAddress.value) return
  loading.value = true; error.value = null; estimate.value = null
  try {
    estimate.value = await tx.estimate({
      entries: utxo.entries.value,
      outputs: [{ address: toAddress.value, amount: amountSompi.value }],
      changeAddress: changeAddress.value,
      priorityFee: BigInt(priorityFee.value || '0'),
      networkId: network.currentNetwork.value,
    })
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally { loading.value = false }
}

async function buildTx() {
  if (!amountSompi.value || !toAddress.value || !changeAddress.value) return
  loading.value = true; error.value = null; pendingTxs.value = []
  try {
    const result = await tx.create({
      entries: utxo.entries.value,
      outputs: [{ address: toAddress.value, amount: amountSompi.value }],
      changeAddress: changeAddress.value,
      priorityFee: BigInt(priorityFee.value || '0'),
      networkId: network.currentNetwork.value,
    })
    pendingTxs.value = result.transactions
    estimate.value = result.summary
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally { loading.value = false }
}

async function signAndSubmit() {
  if (!pendingTxs.value.length || !privateKey.value.trim()) return
  loading.value = true; error.value = null; submittedIds.value = []
  try {
    const ids: string[] = []
    for (const pending of pendingTxs.value) {
      pending.sign([privateKey.value.trim()])
      ids.push(await pending.submit())
    }
    submittedIds.value = ids
    pendingTxs.value = []
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally { loading.value = false }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Transaction Builder</h1>

    <Tabs default-value="track">
      <TabsList class="w-full">
        <TabsTrigger value="track" class="flex-1">1. Load UTXOs</TabsTrigger>
        <TabsTrigger value="build" class="flex-1">2. Build &amp; Send</TabsTrigger>
      </TabsList>

      <!-- Step 1: Track -->
      <TabsContent value="track" class="mt-4 space-y-4">
        <Card>
          <CardContent class="pt-6 space-y-3">
            <div class="flex gap-2">
              <Input v-model="trackAddr" :placeholder="`${addrPrefix}:qr...`" class="font-mono text-sm"
                @keyup.enter="track" />
              <Button :disabled="!trackAddr.trim()" @click="track">Track</Button>
            </div>
            <Alert v-if="trackError" variant="destructive">
              <AlertDescription>{{ trackError }}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card v-if="utxo.isTracking.value">
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Loaded UTXOs</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div class="flex items-center gap-3">
              <span class="text-2xl font-mono font-bold text-primary">
                {{ crypto.sompiToKaspaString(utxo.balance.value.mature + utxo.balance.value.pending) }}
              </span>
              <span class="text-muted-foreground">KAS</span>
              <Badge variant="secondary" class="ml-auto">{{ utxo.entries.value.length }} UTXOs</Badge>
            </div>
            <div class="text-xs text-muted-foreground">
              Addresses: {{ utxo.trackedAddresses.value.join(', ') }}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Step 2: Build -->
      <TabsContent value="build" class="mt-4 space-y-4">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Transaction</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="space-y-1">
              <label class="text-sm text-muted-foreground">To Address</label>
              <Input v-model="toAddress" :placeholder="`${addrPrefix}:qrecipient...`" class="font-mono text-sm" />
            </div>
            <div class="space-y-1">
              <label class="text-sm text-muted-foreground">Change Address</label>
              <Input v-model="changeAddress" :placeholder="`${addrPrefix}:qchange...`" class="font-mono text-sm" />
            </div>
            <div class="flex gap-3">
              <div class="space-y-1 flex-1">
                <label class="text-sm text-muted-foreground">Amount (KAS)</label>
                <Input v-model="amountKas" placeholder="0.5" type="number" step="0.00000001" />
              </div>
              <div class="space-y-1 w-36">
                <label class="text-sm text-muted-foreground">Priority Fee (sompi)</label>
                <Input v-model="priorityFee" placeholder="1000" />
              </div>
            </div>

            <div class="flex gap-2 pt-1">
              <Button variant="secondary"
                :disabled="loading || !amountSompi || !toAddress || !changeAddress || !utxo.entries.value.length"
                @click="runEstimate">Estimate Fees</Button>
              <Button :disabled="loading || !amountSompi || !toAddress || !changeAddress || !utxo.entries.value.length"
                @click="buildTx">Build Transaction</Button>
            </div>
          </CardContent>
        </Card>

        <Alert v-if="error" variant="destructive">
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>

        <!-- Estimate summary -->
        <Card v-if="estimate">
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent class="space-y-1.5 text-sm">
            <div class="flex gap-2">
              <span class="text-muted-foreground w-32">Fees</span>
              <span class="font-mono">{{ estimate.fees }} sompi ({{ crypto.sompiToKaspaString(estimate.fees) }}
                KAS)</span>
            </div>
            <div class="flex gap-2">
              <span class="text-muted-foreground w-32">Mass</span>
              <span class="font-mono">{{ estimate.mass }} grams</span>
            </div>
            <div class="flex gap-2">
              <span class="text-muted-foreground w-32">Transactions</span>
              <span class="font-mono">{{ estimate.transactions }}</span>
            </div>
          </CardContent>
        </Card>

        <!-- Sign + submit -->
        <Card v-if="pendingTxs.length">
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Sign &amp; Submit</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <p class="text-sm text-muted-foreground">
              {{ pendingTxs.length }} transaction{{ pendingTxs.length > 1 ? 's' : '' }} ready. Sign with your private
              key.
            </p>
            <div class="space-y-1">
              <label class="text-sm text-muted-foreground">Private Key (hex)</label>
              <Input v-model="privateKey" type="password" placeholder="64-character hex key" />
            </div>
            <Button :disabled="loading || !privateKey.trim()" @click="signAndSubmit">
              {{ loading ? 'Submitting...' : 'Sign & Submit' }}
            </Button>
          </CardContent>
        </Card>

        <!-- Success -->
        <Card v-if="submittedIds.length">
          <CardHeader class="pb-2">
            <CardTitle class="text-base text-green-400">Submitted</CardTitle>
          </CardHeader>
          <CardContent class="space-y-1">
            <div v-for="txId in submittedIds" :key="txId" class="font-mono text-xs break-all text-primary">
              {{ txId }}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <CodeExample :code="EXAMPLE" title="useUtxo + useTransaction — cross-platform transaction flow" />
  </div>
</template>
