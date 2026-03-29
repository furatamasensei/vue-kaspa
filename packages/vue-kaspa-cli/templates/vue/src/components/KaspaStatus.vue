<script setup lang="ts">
import { computed } from 'vue'
import { useKaspa, useRpc } from 'vue-kaspa'

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

const stateClass = computed(() => {
  if (kaspa.wasmStatus.value !== 'ready') return 'badge--pending'
  if (rpc.connectionState.value === 'connected') return 'badge--ok'
  if (rpc.connectionState.value === 'error') return 'badge--error'
  return 'badge--pending'
})

const daaScore = computed(() =>
  rpc.virtualDaaScore.value > 0n ? rpc.virtualDaaScore.value.toLocaleString() : '—'
)

const links = [
  { label: 'Faucet', title: 'Testnet 10', href: 'https://faucet-tn10.kaspanet.io/' },
  { label: 'Faucet', title: 'Testnet 12', href: 'https://faucet-tn12.kaspanet.io/' },
  { label: 'Docs', title: 'vue-kaspa', href: 'https://vue-kaspa.vercel.app/' },
  { label: 'Explorer', title: 'Testnet 10', href: 'https://tn10.kaspa.stream/' },
  { label: 'Explorer', title: 'Testnet 12', href: 'https://tn12.kaspa.stream/' },
  { label: 'Explorer', title: 'Mainnet', href: 'https://kaspa.stream/' },
]
</script>

<template>
  <div class="bento">

    <!-- Network status card (unchanged) -->
    <div class="card">
      <header class="card__header">
        <span class="logo">⬡</span>
        <h1 class="card__title">vue-kaspa</h1>
        <span class="badge" :class="stateClass">{{ stateLabel }}</span>
      </header>

      <div class="grid">
        <div class="stat">
          <span class="stat__label">Network</span>
          <span class="stat__value">{{ rpc.networkId.value ?? '—' }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">Server version</span>
          <span class="stat__value">{{ rpc.serverVersion.value ?? '—' }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">DAA Score</span>
          <span class="stat__value mono">{{ daaScore }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">Synced</span>
          <span class="stat__value" :class="{ ok: rpc.isSynced.value, muted: !rpc.isConnected.value }">
            {{ rpc.isConnected.value ? (rpc.isSynced.value ? 'Yes' : 'Syncing…') : '—' }}
          </span>
        </div>
      </div>

      <footer class="card__footer">
        <a href="https://vue-kaspa.vercel.app" target="_blank" rel="noopener">Docs</a>
        <span>·</span>
        <a href="https://github.com/furatamasensei/vue-kaspa" target="_blank" rel="noopener">GitHub</a>
      </footer>
    </div>

    <!-- Bento link cards -->
    <div class="link-grid">
      <a
        v-for="link in links"
        :key="link.href"
        :href="link.href"
        target="_blank"
        rel="noopener"
        class="link-card"
      >
        <div class="link-card__top">
          <span class="link-card__label">{{ link.label }}</span>
          <span class="link-card__arrow">↗</span>
        </div>
        <span class="link-card__title">{{ link.title }}</span>
      </a>
    </div>

  </div>
</template>

<style scoped>
.bento {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.card {
  padding: 2rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-soft);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.card__header { display: flex; align-items: center; gap: .75rem; }
.logo { font-size: 1.75rem; color: #49c5a3; line-height: 1; }
.card__title { font-size: 1.25rem; font-weight: 600; color: var(--color-heading); flex: 1; margin: 0; }
.badge {
  font-size: .75rem;
  font-weight: 500;
  padding: .2em .65em;
  border-radius: 999px;
  border: 1px solid currentColor;
  white-space: nowrap;
}
.badge--ok      { color: #4caf50; }
.badge--pending { color: var(--color-muted, #888); }
.badge--error   { color: #f44336; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.stat { display: flex; flex-direction: column; gap: .25rem; }
.stat__label {
  font-size: .7rem;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--color-muted, #888);
}
.stat__value {
  font-size: .95rem;
  color: var(--color-heading);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stat__value.mono  { font-family: monospace; }
.stat__value.ok    { color: #4caf50; }
.stat__value.muted { color: var(--color-muted, #888); }
.card__footer {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .85rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
}
.card__footer a { color: var(--color-text); text-decoration: none; }
.card__footer a:hover { color: var(--color-heading); }

/* Bento link grid */
.link-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}
.link-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-soft);
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.15s;
}
.link-card:hover { border-color: #49c5a3; }
.link-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.link-card__label {
  font-size: .65rem;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--color-muted, #888);
}
.link-card__arrow { font-size: .75rem; color: var(--color-muted, #888); }
.link-card__title {
  font-size: .85rem;
  font-weight: 600;
  color: var(--color-heading);
}
</style>
