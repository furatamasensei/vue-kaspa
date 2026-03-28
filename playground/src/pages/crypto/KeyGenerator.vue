<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { computed, ref } from 'vue'
import { useCrypto, useNetwork, type KeypairInfo, type MnemonicInfo } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'

const crypto = useCrypto()
const network = useNetwork()

const EXAMPLE = computed(() => `import { useCrypto, useNetwork } from 'vue-kaspa'

const crypto = useCrypto()
const { currentNetwork } = useNetwork()

// Generate a BIP-39 mnemonic
const { phrase, wordCount } = crypto.generateMnemonic(24)  // or 12

// Derive keypair from mnemonic (uses active network)
const { address, publicKeyHex, privateKeyHex } =
  crypto.mnemonicToKeypair(phrase, currentNetwork.value)  // '${network.currentNetwork.value}'

// Or generate a random keypair directly (no mnemonic)
const keypair = crypto.generateKeypair(currentNetwork.value)`)

// Mnemonic tab
const wordCount = ref<12 | 24>(24)
const mnemonic = ref<MnemonicInfo | null>(null)
const derivedKeypair = ref<KeypairInfo | null>(null)

function generateMnemonic() {
  mnemonic.value = crypto.generateMnemonic(wordCount.value)
  derivedKeypair.value = null
}

function deriveFromMnemonic() {
  if (!mnemonic.value) return
  derivedKeypair.value = crypto.mnemonicToKeypair(mnemonic.value.phrase, network.currentNetwork.value)
}

// Random keypair tab
const keypair = ref<KeypairInfo | null>(null)

function generateRandom() {
  keypair.value = crypto.generateKeypair(network.currentNetwork.value)
}

function copy(text: string) {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Key Generator</h1>

    <Tabs default-value="mnemonic">
      <TabsList class="w-full">
        <TabsTrigger value="mnemonic" class="flex-1">Mnemonic</TabsTrigger>
        <TabsTrigger value="random" class="flex-1">Random Keypair</TabsTrigger>
      </TabsList>

      <!-- Mnemonic tab -->
      <TabsContent value="mnemonic" class="space-y-4 mt-4">
        <Card>
          <CardContent class="pt-6 space-y-3">
            <div class="flex items-center gap-3">
              <span class="text-sm text-muted-foreground">Word count:</span>
              <Button :variant="wordCount === 12 ? 'default' : 'secondary'" size="sm"
                @click="wordCount = 12">12</Button>
              <Button :variant="wordCount === 24 ? 'default' : 'secondary'" size="sm"
                @click="wordCount = 24">24</Button>
            </div>
            <Button @click="generateMnemonic">Generate Mnemonic</Button>
          </CardContent>
        </Card>

        <Card v-if="mnemonic">
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Mnemonic Phrase</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="rounded-md bg-muted/30 p-3">
              <div class="flex flex-wrap gap-1.5">
                <span v-for="(word, i) in mnemonic.phrase.split(' ')" :key="i"
                  class="rounded bg-muted px-2 py-1 text-sm">
                  <span class="text-muted-foreground mr-1 text-xs">{{ i + 1 }}</span>{{ word }}
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <Button variant="secondary" size="sm" @click="copy(mnemonic.phrase)">Copy Phrase</Button>
              <Button size="sm" @click="deriveFromMnemonic">Derive Keypair →</Button>
            </div>
          </CardContent>
        </Card>

        <Card v-if="derivedKeypair">
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Derived Keypair</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div>
              <p class="text-xs text-muted-foreground mb-1">Address</p>
              <p class="font-mono text-sm text-primary break-all cursor-pointer hover:opacity-80"
                @click="copy(derivedKeypair.address)">
                {{ derivedKeypair.address }}
              </p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">Public Key</p>
              <p class="font-mono text-xs break-all">{{ derivedKeypair.publicKeyHex }}</p>
            </div>
            <div>
              <p class="text-xs text-destructive mb-1">Private Key (handle with care)</p>
              <p class="font-mono text-xs break-all text-destructive blur-sm hover:blur-none transition-all cursor-pointer"
                @click="copy(derivedKeypair.privateKeyHex)">{{ derivedKeypair.privateKeyHex }}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Random tab -->
      <TabsContent value="random" class="space-y-4 mt-4">
        <Card>
          <CardContent class="pt-6">
            <Button @click="generateRandom">Generate Random Keypair</Button>
          </CardContent>
        </Card>

        <Card v-if="keypair">
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Keypair</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div>
              <p class="text-xs text-muted-foreground mb-1">Address</p>
              <p class="font-mono text-sm text-primary break-all cursor-pointer hover:opacity-80"
                @click="copy(keypair.address)">
                {{ keypair.address }}
              </p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-1">Public Key</p>
              <p class="font-mono text-xs break-all">{{ keypair.publicKeyHex }}</p>
            </div>
            <div>
              <p class="text-xs text-destructive mb-1">Private Key</p>
              <p class="font-mono text-xs break-all text-destructive blur-sm hover:blur-none transition-all cursor-pointer"
                @click="copy(keypair.privateKeyHex)">{{ keypair.privateKeyHex }}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <CodeExample :code="EXAMPLE" title="useCrypto — mnemonic & keypair generation (network-aware)" />
  </div>
</template>
