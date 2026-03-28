<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCrypto } from 'vue-kaspa'

const crypto = useCrypto()

const kasValue = ref('1')
const sompiValue = ref('')
const updating = ref(false)

watch(kasValue, (val) => {
  if (updating.value) return
  updating.value = true
  try {
    if (val) {
      const s = crypto.kaspaToSompi(val)
      sompiValue.value = s.toString()
    } else {
      sompiValue.value = ''
    }
  } catch {
    sompiValue.value = ''
  }
  updating.value = false
})

watch(sompiValue, (val) => {
  if (updating.value) return
  updating.value = true
  try {
    if (val) {
      kasValue.value = crypto.sompiToKaspa(BigInt(val))
    } else {
      kasValue.value = ''
    }
  } catch {
    kasValue.value = ''
  }
  updating.value = false
})

// Initialize
sompiValue.value = crypto.kaspaToSompi('1').toString()

const examples = [
  { label: '1 KAS', kas: '1' },
  { label: '0.001 KAS', kas: '0.001' },
  { label: '1000 KAS', kas: '1000' },
  { label: 'Max Supply (28.7B)', kas: '28700000000' },
]
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Unit Converter</h1>
    <p style="color:#64748b;margin-bottom:16px;font-size:14px">
      1 KAS = 1,000,000,000 sompi (10⁹). This converter works without WASM initialization.
    </p>

    <div class="card">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center">
        <div>
          <div class="label">KAS</div>
          <input v-model="kasValue" class="input" type="number" step="any" placeholder="0" />
        </div>
        <div style="color:#64748b;font-size:20px;padding-top:20px">=</div>
        <div>
          <div class="label">Sompi</div>
          <input v-model="sompiValue" class="input" type="number" step="1" placeholder="0" />
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Quick Examples</h2>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <button
          v-for="ex in examples"
          :key="ex.kas"
          class="btn btn-secondary"
          @click="kasValue = ex.kas"
        >{{ ex.label }}</button>
      </div>
    </div>

    <div class="card">
      <h2>Formatted</h2>
      <div v-if="sompiValue">
        <div class="label">sompiToKaspaString()</div>
        <div class="value mono" style="font-size:18px;color:#70c7ba">
          {{ sompiValue ? crypto.sompiToKaspaString(BigInt(sompiValue)) : '-' }} KAS
        </div>
      </div>
    </div>
  </div>
</template>
