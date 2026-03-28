<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ref } from 'vue'
import { useCrypto } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'

const EXAMPLE = `import { useCrypto } from 'vue-kaspa'

const crypto = useCrypto()

// Sign a message with a private key (hex)
const signature = crypto.signMessage(message, privateKeyHex)

// Verify a signature with the corresponding public key (hex)
const valid: boolean = crypto.verifyMessage(message, signature, publicKeyHex)`

const crypto = useCrypto()

// Sign tab
const message = ref('')
const privateKeyHex = ref('')
const signature = ref<string | null>(null)
const signError = ref<string | null>(null)

function sign() {
  signError.value = null
  try {
    signature.value = crypto.signMessage(message.value, privateKeyHex.value)
  } catch (e: unknown) {
    signError.value = e instanceof Error ? e.message : String(e)
  }
}

// Verify tab
const verifyMessage = ref('')
const verifySignature = ref('')
const verifyPubKey = ref('')
const verifyResult = ref<boolean | null>(null)

function verify() {
  try {
    verifyResult.value = crypto.verifyMessage(verifyMessage.value, verifySignature.value, verifyPubKey.value)
  } catch (e: unknown) {
    verifyResult.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Message Signer</h1>

    <Tabs default-value="sign">
      <TabsList class="w-full">
        <TabsTrigger value="sign" class="flex-1">Sign</TabsTrigger>
        <TabsTrigger value="verify" class="flex-1">Verify</TabsTrigger>
      </TabsList>

      <TabsContent value="sign" class="mt-4">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Sign Message</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="space-y-1">
              <label class="text-sm text-muted-foreground">Message</label>
              <Textarea v-model="message" rows="3" placeholder="Enter message to sign..." />
            </div>
            <div class="space-y-1">
              <label class="text-sm text-muted-foreground">Private Key (hex)</label>
              <Input v-model="privateKeyHex" type="password" placeholder="64-character hex private key" />
            </div>
            <Button :disabled="!message || !privateKeyHex" @click="sign">Sign Message</Button>
            <p v-if="signError" class="text-sm text-destructive">{{ signError }}</p>
            <div v-if="signature" class="space-y-1">
              <p class="text-sm text-muted-foreground">Signature</p>
              <p class="font-mono text-xs break-all rounded-md bg-muted/40 p-3">{{ signature }}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="verify" class="mt-4">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Verify Signature</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="space-y-1">
              <label class="text-sm text-muted-foreground">Message</label>
              <Textarea v-model="verifyMessage" rows="2" />
            </div>
            <div class="space-y-1">
              <label class="text-sm text-muted-foreground">Signature (hex)</label>
              <Input v-model="verifySignature" placeholder="Signature hex" />
            </div>
            <div class="space-y-1">
              <label class="text-sm text-muted-foreground">Public Key (hex)</label>
              <Input v-model="verifyPubKey" placeholder="Public key hex" />
            </div>
            <Button :disabled="!verifyMessage || !verifySignature || !verifyPubKey" @click="verify">
              Verify
            </Button>
            <div v-if="verifyResult !== null">
              <Badge :variant="verifyResult ? 'default' : 'destructive'" class="text-sm px-4 py-1">
                {{ verifyResult ? '✓ Valid signature' : '✗ Invalid signature' }}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <CodeExample :code="EXAMPLE" title="useCrypto — signMessage / verifyMessage" />
  </div>
</template>
