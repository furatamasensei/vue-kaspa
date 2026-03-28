<script setup lang="ts">
import { ref } from 'vue'
import { useCrypto } from 'vue-kaspa'

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

const tab = ref<'sign' | 'verify'>('sign')
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Message Signer</h1>

    <div class="card" style="margin-bottom:8px">
      <div style="display:flex;gap:8px">
        <button :class="['btn', tab === 'sign' ? 'btn-primary' : 'btn-secondary']" @click="tab = 'sign'">Sign</button>
        <button :class="['btn', tab === 'verify' ? 'btn-primary' : 'btn-secondary']" @click="tab = 'verify'">Verify</button>
      </div>
    </div>

    <div v-if="tab === 'sign'" class="card">
      <div class="label">Message</div>
      <textarea v-model="message" class="input" rows="3" placeholder="Enter message to sign..." style="resize:vertical" />
      <div class="label">Private Key (hex)</div>
      <input v-model="privateKeyHex" class="input" type="password" placeholder="64-character hex private key" />
      <button class="btn btn-primary" :disabled="!message || !privateKeyHex" @click="sign">Sign Message</button>
      <div v-if="signError" style="color:#f87171;margin-top:8px;font-size:13px">{{ signError }}</div>
      <div v-if="signature" style="margin-top:12px">
        <div class="label">Signature</div>
        <div class="value mono" style="background:#0f172a;padding:12px;border-radius:6px;font-size:12px;word-break:break-all">{{ signature }}</div>
      </div>
    </div>

    <div v-if="tab === 'verify'" class="card">
      <div class="label">Message</div>
      <textarea v-model="verifyMessage" class="input" rows="2" style="resize:vertical" />
      <div class="label">Signature (hex)</div>
      <input v-model="verifySignature" class="input" placeholder="Signature hex" />
      <div class="label">Public Key (hex)</div>
      <input v-model="verifyPubKey" class="input" placeholder="Public key hex" />
      <button class="btn btn-primary" :disabled="!verifyMessage || !verifySignature || !verifyPubKey" @click="verify">Verify</button>
      <div v-if="verifyResult !== null" style="margin-top:12px">
        <span :class="['badge', verifyResult ? 'badge-green' : 'badge-red']" style="font-size:14px;padding:6px 16px">
          {{ verifyResult ? '✓ Valid signature' : '✗ Invalid signature' }}
        </span>
      </div>
    </div>
  </div>
</template>
