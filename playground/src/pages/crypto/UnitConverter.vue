<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { computed, ref, watch } from 'vue'
import { useCrypto } from 'vue-kaspa'
import CodeExample from '../../components/CodeExample.vue'

const EXAMPLE = `import { useCrypto } from 'vue-kaspa'

const crypto = useCrypto()

// KAS string → sompi (BigInt)
const sompi: bigint = crypto.kaspaToSompi('1.5')    // 1_500_000_000n
const sompi2: bigint = crypto.kaspaToSompi('0.001') // 1_000_000n

// sompi → KAS display string
const kas: string = crypto.sompiToKaspaString(1_500_000_000n)  // '1.5'
const kas2: string = crypto.sompiToKaspaString(100n)           // '0.0000001'

// 1 KAS = 1,000,000,000 sompi (10⁹)`

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
  if (!val || !/^\d+$/.test(val.trim())) { kasValue.value = ''; return }
  updating.value = true
  try {
    kasValue.value = crypto.sompiToKaspa(BigInt(val.trim()))
  } catch {
    kasValue.value = ''
  }
  updating.value = false
})

// Initialize (guard against WASM not yet loaded)
try {
  sompiValue.value = crypto.kaspaToSompi('1').toString()
} catch {
  sompiValue.value = '100000000'
}

const formattedKas = computed(() => {
  if (!sompiValue.value) return '-'
  try {
    return crypto.sompiToKaspaString(BigInt(sompiValue.value))
  } catch {
    return '-'
  }
})

const examples = [
  { label: '1 KAS', kas: '1' },
  { label: '0.001 KAS', kas: '0.001' },
  { label: '1000 KAS', kas: '1000' },
  { label: 'Max Supply (28.7B)', kas: '28700000000' },
]
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Unit Converter</h1>
    <p class="text-sm text-muted-foreground">1 KAS = 1,000,000,000 sompi (10⁹). This converter works without WASM
      initialization.</p>

    <Card>
      <CardContent class="pt-6">
        <div class="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <div class="space-y-1">
            <label class="text-sm text-muted-foreground">KAS</label>
            <Input v-model="kasValue" type="number" step="any" placeholder="0" />
          </div>
          <div class="text-muted-foreground text-xl pb-2">=</div>
          <div class="space-y-1">
            <label class="text-sm text-muted-foreground">Sompi</label>
            <Input v-model="sompiValue" type="text" placeholder="0" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Quick Examples</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button v-for="ex in examples" :key="ex.kas" variant="secondary" size="sm" @click="kasValue = ex.kas">{{
            ex.label }}</Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">Formatted</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="sompiValue" class="space-y-1">
          <p class="text-xs text-muted-foreground">sompiToKaspaString()</p>
          <p class="font-mono text-2xl text-primary">{{ formattedKas }} KAS</p>
        </div>
      </CardContent>
    </Card>

    <CodeExample :code="EXAMPLE" title="useCrypto — kaspaToSompi / sompiToKaspaString" />
  </div>
</template>
