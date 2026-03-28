<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useCrypto, useNetwork, type DerivedKey, type KaspaNetwork } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const crypto = useCrypto()
const globalNetwork = useNetwork()

const EXAMPLE = computed(() => `import { useCrypto, useNetwork } from 'vue-kaspa'

const crypto = useCrypto()
const { currentNetwork } = useNetwork()

// BIP-32 HD derivation from mnemonic (uses active network)
const { receive, change } = crypto.derivePublicKeys(
  phrase,                    // 12 or 24 word mnemonic
  currentNetwork.value,      // '${globalNetwork.currentNetwork.value}'
  5,                         // receive address count
  5                          // change address count
)

// receive[i].index   — derivation index
// receive[i].address — '${globalNetwork.isTestnet.value ? 'kaspatest' : 'kaspa'}:q...'
// change[i].index / change[i].address`)

const phrase = ref('')
const network = ref<KaspaNetwork>(globalNetwork.currentNetwork.value)
const count = ref(5)

// Keep in sync when global network changes
watch(globalNetwork.currentNetwork, (n) => { network.value = n })
const keys = ref<{ receive: DerivedKey[]; change: DerivedKey[] } | null>(null)
const error = ref<string | null>(null)

function derive() {
  if (!phrase.value.trim()) return
  error.value = null
  try {
    keys.value = crypto.derivePublicKeys(phrase.value.trim(), network.value, count.value, count.value)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Address Deriver</h1>

    <Card>
      <CardContent class="pt-6 space-y-3">
        <div class="space-y-1">
          <label class="text-sm text-muted-foreground">Mnemonic Phrase</label>
          <Textarea v-model="phrase" rows="3" placeholder="Enter 12 or 24 word mnemonic..." />
        </div>
        <div class="flex gap-4">
          <div class="space-y-1 flex-1">
            <label class="text-sm text-muted-foreground">Network</label>
            <Select v-model="network">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="n in globalNetwork.availableNetworks" :key="n" :value="n">{{ n }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-1 w-28">
            <label class="text-sm text-muted-foreground">Count per chain</label>
            <Input v-model.number="count" type="number" min="1" max="20" />
          </div>
        </div>
        <Button :disabled="!phrase.trim()" @click="derive">Derive Keys</Button>
      </CardContent>
    </Card>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <Card v-if="keys">
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Receive Addresses</CardTitle>
      </CardHeader>
      <CardContent class="space-y-1.5">
        <div v-for="key in keys.receive" :key="key.index" class="flex items-center gap-3">
          <span class="text-xs text-muted-foreground w-6 text-right shrink-0">{{ key.index }}</span>
          <span class="font-mono text-sm text-primary break-all">{{ key.address }}</span>
        </div>
      </CardContent>
    </Card>

    <Card v-if="keys">
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Change Addresses</CardTitle>
      </CardHeader>
      <CardContent class="space-y-1.5">
        <div v-for="key in keys.change" :key="key.index" class="flex items-center gap-3">
          <span class="text-xs text-muted-foreground w-6 text-right shrink-0">{{ key.index }}</span>
          <span class="font-mono text-sm text-muted-foreground break-all">{{ key.address }}</span>
        </div>
      </CardContent>
    </Card>

    <CodeExample :code="EXAMPLE" title="useCrypto — BIP-32 address derivation" />
  </div>
</template>
