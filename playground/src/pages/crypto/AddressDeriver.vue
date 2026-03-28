<script setup lang="ts">
import { ref } from 'vue'
import { useCrypto, type DerivedKey } from 'vue-kaspa'

const crypto = useCrypto()
const phrase = ref('')
const network = ref<'mainnet' | 'testnet-10' | 'testnet-11'>('mainnet')
const count = ref(5)
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
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Address Deriver</h1>
    <div class="card">
      <div class="label">Mnemonic Phrase</div>
      <textarea v-model="phrase" class="input" rows="3" placeholder="Enter 12 or 24 word mnemonic..." style="resize:vertical" />
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <div>
          <div class="label">Network</div>
          <select v-model="network" class="input" style="margin-bottom:0">
            <option>mainnet</option>
            <option>testnet-10</option>
            <option>testnet-11</option>
          </select>
        </div>
        <div>
          <div class="label">Count per chain</div>
          <input v-model.number="count" class="input" type="number" min="1" max="20" style="margin-bottom:0;width:80px" />
        </div>
      </div>
      <button class="btn btn-primary" :disabled="!phrase.trim()" @click="derive">Derive Keys</button>
    </div>
    <div v-if="error" class="card" style="border-color:#ef4444"><p style="color:#f87171">{{ error }}</p></div>
    <div v-if="keys" class="card">
      <h2>Receive Addresses</h2>
      <div v-for="key in keys.receive" :key="key.index" class="row" style="margin-bottom:8px">
        <span style="color:#475569;min-width:24px;font-size:12px">{{ key.index }}</span>
        <span class="value mono" style="color:#70c7ba;font-size:13px">{{ key.address }}</span>
      </div>
    </div>
    <div v-if="keys" class="card">
      <h2>Change Addresses</h2>
      <div v-for="key in keys.change" :key="key.index" class="row" style="margin-bottom:8px">
        <span style="color:#475569;min-width:24px;font-size:12px">{{ key.index }}</span>
        <span class="value mono" style="color:#94a3b8;font-size:13px">{{ key.address }}</span>
      </div>
    </div>
  </div>
</template>
