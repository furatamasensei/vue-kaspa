<script setup lang="ts">
import { ref } from 'vue'
import { useCrypto, type KeypairInfo, type MnemonicInfo } from 'vue-kaspa'

const crypto = useCrypto()
const tab = ref<'mnemonic' | 'random'>('mnemonic')

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
  derivedKeypair.value = crypto.mnemonicToKeypair(mnemonic.value.phrase, 'mainnet')
}

// Random keypair tab
const keypair = ref<KeypairInfo | null>(null)

function generateRandom() {
  keypair.value = crypto.generateKeypair('mainnet')
}

function copy(text: string) {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Key Generator</h1>

    <div class="card" style="margin-bottom:8px">
      <div style="display:flex;gap:8px">
        <button :class="['btn', tab === 'mnemonic' ? 'btn-primary' : 'btn-secondary']" @click="tab = 'mnemonic'">Mnemonic</button>
        <button :class="['btn', tab === 'random' ? 'btn-primary' : 'btn-secondary']" @click="tab = 'random'">Random Keypair</button>
      </div>
    </div>

    <!-- Mnemonic tab -->
    <div v-if="tab === 'mnemonic'">
      <div class="card">
        <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">
          <span class="label" style="margin-bottom:0">Word count:</span>
          <button :class="['btn', wordCount === 12 ? 'btn-primary' : 'btn-secondary']" style="padding:4px 8px" @click="wordCount = 12">12</button>
          <button :class="['btn', wordCount === 24 ? 'btn-primary' : 'btn-secondary']" style="padding:4px 8px" @click="wordCount = 24">24</button>
        </div>
        <button class="btn btn-primary" @click="generateMnemonic">Generate Mnemonic</button>
      </div>

      <div v-if="mnemonic" class="card">
        <h2>Mnemonic Phrase</h2>
        <div style="background:#0f172a;padding:12px;border-radius:6px;margin-bottom:12px">
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            <span
              v-for="(word, i) in mnemonic.phrase.split(' ')"
              :key="i"
              style="background:#1e293b;padding:4px 8px;border-radius:4px;font-size:13px"
            >
              <span style="color:#475569;margin-right:4px">{{ i + 1 }}</span>{{ word }}
            </span>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" @click="copy(mnemonic.phrase)">Copy Phrase</button>
          <button class="btn btn-primary" @click="deriveFromMnemonic">Derive Keypair →</button>
        </div>
      </div>

      <div v-if="derivedKeypair" class="card">
        <h2>Derived Keypair</h2>
        <div class="label">Address</div>
        <div class="value mono" style="color:#70c7ba;margin-bottom:8px;cursor:pointer" @click="copy(derivedKeypair.address)">
          {{ derivedKeypair.address }}
        </div>
        <div class="label">Public Key</div>
        <div class="value mono" style="margin-bottom:8px;font-size:12px">{{ derivedKeypair.publicKeyHex }}</div>
        <div class="label" style="color:#f87171">Private Key (handle with care)</div>
        <div class="value mono" style="font-size:12px;color:#ef4444;filter:blur(4px)" @mouseenter="($event.target as HTMLElement).style.filter='none'" @mouseleave="($event.target as HTMLElement).style.filter='blur(4px)'">
          {{ derivedKeypair.privateKeyHex }}
        </div>
      </div>
    </div>

    <!-- Random tab -->
    <div v-if="tab === 'random'">
      <div class="card">
        <button class="btn btn-primary" @click="generateRandom">Generate Random Keypair</button>
      </div>
      <div v-if="keypair" class="card">
        <h2>Keypair</h2>
        <div class="label">Address</div>
        <div class="value mono" style="color:#70c7ba;margin-bottom:8px;cursor:pointer" @click="copy(keypair.address)">{{ keypair.address }}</div>
        <div class="label">Public Key</div>
        <div class="value mono" style="font-size:12px;margin-bottom:8px">{{ keypair.publicKeyHex }}</div>
        <div class="label" style="color:#f87171">Private Key</div>
        <div class="value mono" style="font-size:12px;color:#ef4444;filter:blur(4px)" @mouseenter="($event.target as HTMLElement).style.filter='none'" @mouseleave="($event.target as HTMLElement).style.filter='blur(4px)'">{{ keypair.privateKeyHex }}</div>
      </div>
    </div>
  </div>
</template>
