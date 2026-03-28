<script setup lang="ts">
import { onMounted } from 'vue'
import { useKaspa, useRpc } from 'vue-kaspa'
import KaspaStatus from './components/KaspaStatus.vue'

const kaspa = useKaspa()
const rpc = useRpc()

// KaspaPlugin doesn't call init/connect automatically — we do it here.
// The promise is not awaited so the app renders immediately while WASM
// loads and the RPC connection establishes in the background.
onMounted(() => {
  kaspa.init().then(() => rpc.connect()).catch(() => {})
})
</script>

<template>
  <main>
    <KaspaStatus />
  </main>
</template>
