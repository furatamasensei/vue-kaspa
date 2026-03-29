<script setup lang="ts">
// useKaspa, useRpc, and computed are auto-imported by Nuxt.
// WASM init and RPC connection are handled automatically by the vue-kaspa Nuxt module
// when autoConnect: true (the default). No manual connect call is needed here.

const kaspa = useKaspa()
const rpc = useRpc()

const stateLabel = computed(() => {
  if (kaspa.wasmStatus.value === 'loading') return 'Loading WASM…'
  if (kaspa.wasmStatus.value === 'error') return 'WASM Error'
  return ({
    disconnected: 'Disconnected',
    connecting: 'Connecting…',
    connected: 'Connected',
    reconnecting: 'Reconnecting…',
    error: 'Connection Error',
  } as Record<string, string>)[rpc.connectionState.value] ?? rpc.connectionState.value
})

const badgeColor = computed(() => {
  if (kaspa.wasmStatus.value !== 'ready') return '#9ca3af'
  if (rpc.connectionState.value === 'connected') return '#4caf50'
  if (rpc.connectionState.value === 'error') return '#f44336'
  return '#9ca3af'
})

const daaScore = computed(() =>
  rpc.virtualDaaScore.value > 0n ? rpc.virtualDaaScore.value.toLocaleString() : '—'
)
</script>

<template>
  <div style="width:100%;max-width:480px;padding:2rem;border:1px solid #e2e8f0;border-radius:10px;background:#f9f9f9;display:flex;flex-direction:column;gap:1.5rem;font-family:Inter,system-ui,sans-serif;">
    <header style="display:flex;align-items:center;gap:.75rem;">
      <span style="font-size:1.75rem;color:#49c5a3;line-height:1;">⬡</span>
      <h1 style="font-size:1.25rem;font-weight:600;color:#1a1a1a;flex:1;margin:0;">vue-kaspa</h1>
      <span :style="`font-size:.75rem;font-weight:500;padding:.2em .65em;border-radius:999px;border:1px solid ${badgeColor};color:${badgeColor};white-space:nowrap;`">
        {{ stateLabel }}
      </span>
    </header>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
      <div style="display:flex;flex-direction:column;gap:.25rem;">
        <span style="font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af;">Network</span>
        <span style="font-size:.95rem;color:#1a1a1a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ rpc.networkId.value ?? '—' }}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:.25rem;">
        <span style="font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af;">Server version</span>
        <span style="font-size:.95rem;color:#1a1a1a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ rpc.serverVersion.value ?? '—' }}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:.25rem;">
        <span style="font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af;">DAA Score</span>
        <span style="font-size:.95rem;color:#1a1a1a;font-family:monospace;">{{ daaScore }}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:.25rem;">
        <span style="font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af;">Synced</span>
        <span :style="`font-size:.95rem;color:${rpc.isConnected.value ? (rpc.isSynced.value ? '#4caf50' : '#1a1a1a') : '#9ca3af'};`">
          {{ rpc.isConnected.value ? (rpc.isSynced.value ? 'Yes' : 'Syncing…') : '—' }}
        </span>
      </div>
    </div>

    <footer style="display:flex;align-items:center;gap:.5rem;font-size:.85rem;border-top:1px solid #e2e8f0;padding-top:1rem;">
      <a href="https://vue-kaspa.vercel.app" target="_blank" rel="noopener" style="color:#374151;text-decoration:none;">Docs</a>
      <span>·</span>
      <a href="https://github.com/furatamasensei/vue-kaspa" target="_blank" rel="noopener" style="color:#374151;text-decoration:none;">GitHub</a>
    </footer>
  </div>
</template>
