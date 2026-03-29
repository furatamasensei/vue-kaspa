<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
// useKaspa, useRpc, and computed are auto-imported by Nuxt.

const kaspa = useKaspa()
const rpc = useRpc()
const bento = ref<HTMLElement | null>(null)
const donateDialog = ref<HTMLDialogElement | null>(null)

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
  if (kaspa.wasmStatus.value !== 'ready') return 'var(--ks-muted)'
  if (rpc.connectionState.value === 'connected') return '#4caf50'
  if (rpc.connectionState.value === 'error') return '#f44336'
  return 'var(--ks-muted)'
})

const daaScore = computed(() =>
  rpc.virtualDaaScore.value > 0n ? rpc.virtualDaaScore.value.toLocaleString() : '—'
)

const links = [
  { label: 'Faucet',   title: 'Testnet 10', desc: 'Get free test KAS',    icon: '💧', href: 'https://faucet-tn10.kaspanet.io/' },
  { label: 'Faucet',   title: 'Testnet 12', desc: 'Get free test KAS',    icon: '💧', href: 'https://faucet-tn12.kaspanet.io/' },
  { label: 'Docs',     title: 'vue-kaspa',  desc: 'Read the full docs',   icon: '📖', href: 'https://vue-kaspa.vercel.app/' },
  { label: 'Explorer', title: 'Testnet 10', desc: 'Browse transactions',  icon: '🔍', href: 'https://tn10.kaspa.stream/' },
  { label: 'Explorer', title: 'Testnet 12', desc: 'Browse transactions',  icon: '🔍', href: 'https://tn12.kaspa.stream/' },
  { label: 'Explorer', title: 'Mainnet',    desc: 'Browse transactions',  icon: '🔍', href: 'https://kaspa.stream/' },
]

function onMouseMove(e: MouseEvent) {
  const cards = bento.value?.querySelectorAll<HTMLElement>('[data-shine]') ?? []
  for (const card of cards) {
    const r = card.getBoundingClientRect()
    card.style.setProperty('--x', `${e.clientX - r.left}px`)
    card.style.setProperty('--y', `${e.clientY - r.top}px`)
  }
}

onMounted(() => window.addEventListener('mousemove', onMouseMove))
onUnmounted(() => window.removeEventListener('mousemove', onMouseMove))
</script>

<template>
  <!-- Donation dialog -->
  <dialog ref="donateDialog" class="ks-dialog" @click.self="donateDialog?.close()">
    <div class="ks-dialog-inner">
      <button class="ks-dialog-close" @click="donateDialog?.close()">✕</button>
      <p class="ks-dialog-title">Support vue-kaspa ❤️</p>
      <p class="ks-dialog-body">vue-kaspa is free and open-source. If it saves you time, consider sending some KAS — every bit helps keep the project alive and maintained.</p>
      <code class="ks-dialog-addr">kaspa:qypr7ayn2g55fccyv9n6gf9zgrcnpepkfgjf9d8mtfp68ezv3mgqnggxqs902q4</code>
      <p class="ks-dialog-thanks">Thank you for your support 🙏</p>
    </div>
  </dialog>

  <div class="ks-root">

    <!-- Header -->
    <header class="ks-header">
      <img src="/logo.png" alt="vue-kaspa" class="ks-header-logo" />
      <span class="ks-header-brand">vue-kaspa</span>
      <nav class="ks-header-nav">
        <a
          href="https://github.com/furatamasensei/vue-kaspa"
          target="_blank"
          rel="noopener"
          class="ks-icon-btn"
          title="GitHub"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
        </a>
        <button class="ks-icon-btn" title="Support this project" @click="donateDialog?.showModal()">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 21.593c-.425-.396-8.8-8.044-8.8-12.593C3.2 5.796 7.192 3 12 3s8.8 2.796 8.8 6c0 4.549-8.375 12.197-8.8 12.593z"/>
          </svg>
        </button>
      </nav>
    </header>

    <!-- Bento grid — Γ layout: net card spans col 1–2 × row 1–3, links fill col 3 then bottom row -->
    <div ref="bento" class="ks-grid">

      <!-- Network card -->
      <div data-shine class="ks-shine ks-net-shine">
        <div class="ks-card ks-net-card">
          <div class="ks-net-top">
            <span class="ks-net-icon">⬡</span>
            <span
              class="ks-badge"
              :style="`border-color:${badgeColor};color:${badgeColor}`"
            >{{ stateLabel }}</span>
          </div>
          <div class="ks-stats">
            <div class="ks-stat">
              <span class="ks-stat-label">Network</span>
              <span class="ks-stat-value">{{ rpc.networkId.value ?? '—' }}</span>
            </div>
            <div class="ks-stat">
              <span class="ks-stat-label">Server version</span>
              <span class="ks-stat-value">{{ rpc.serverVersion.value ?? '—' }}</span>
            </div>
            <div class="ks-stat">
              <span class="ks-stat-label">DAA Score</span>
              <span class="ks-stat-value" style="font-family:monospace">{{ daaScore }}</span>
            </div>
            <div class="ks-stat">
              <span class="ks-stat-label">Synced</span>
              <span
                class="ks-stat-value"
                :style="`color:${rpc.isConnected.value ? (rpc.isSynced.value ? '#4caf50' : 'var(--ks-text)') : 'var(--ks-muted)'}`"
              >{{ rpc.isConnected.value ? (rpc.isSynced.value ? 'Yes' : 'Syncing…') : '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Link cards — auto-placed: first 3 fill col 3 rows 1–3, last 3 fill row 4 -->
      <a
        v-for="link in links"
        :key="link.href"
        data-shine
        class="ks-shine ks-link-shine"
        :href="link.href"
        target="_blank"
        rel="noopener"
      >
        <div class="ks-card ks-link-card">
          <div class="ks-link-top">
            <span class="ks-link-icon">{{ link.icon }}</span>
            <span class="ks-link-arrow">↗</span>
          </div>
          <div>
            <div class="ks-link-label">{{ link.label }}</div>
            <div class="ks-link-title">{{ link.title }}</div>
            <div class="ks-link-desc">{{ link.desc }}</div>
          </div>
        </div>
      </a>

    </div>
  </div>
</template>

<style scoped>
/* Root */
.ks-root {
  width: 100%;
  max-width: 720px;
  font-family: Inter, system-ui, -apple-system, sans-serif;
}

/* Header */
.ks-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
}
.ks-header-logo { width: 28px; height: 28px; object-fit: contain; }
.ks-header-brand { font-size: 1rem; font-weight: 700; color: var(--ks-heading); flex: 1; }
.ks-header-nav { display: flex; gap: 0.15rem; }

.ks-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--ks-muted);
  cursor: pointer;
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}
.ks-icon-btn:hover { color: var(--ks-heading); background: var(--ks-border); }

/* Grid */
.ks-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

/* Shine wrapper — 1px padding reveals radial gradient as a glowing border */
.ks-shine {
  padding: 1px;
  border-radius: 14px;
  background: radial-gradient(
    350px circle at var(--x, -9999px) var(--y, -9999px),
    var(--ks-shine),
    var(--ks-border) 80%
  );
  display: block;
  text-decoration: none;
}

/* Network card occupies col 1–2, row 1–3 */
.ks-net-shine {
  grid-column: 1 / span 2;
  grid-row: 1 / span 3;
}

/* Card base — solid fill sits inside the 1px shine gap */
.ks-card {
  border-radius: 13px;
  background: var(--ks-soft);
  height: 100%;
}

/* Network card */
.ks-net-card {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 320px;
}
.ks-net-top { display: flex; align-items: center; justify-content: space-between; }
.ks-net-icon { font-size: 2.25rem; color: var(--ks-accent); line-height: 1; }
.ks-badge {
  font-size: .7rem;
  font-weight: 500;
  padding: .2em .6em;
  border-radius: 999px;
  border: 1px solid;
  white-space: nowrap;
}
.ks-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem; }
.ks-stat { display: flex; flex-direction: column; gap: .25rem; }
.ks-stat-label {
  font-size: .65rem;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--ks-muted);
}
.ks-stat-value {
  font-size: .95rem;
  color: var(--ks-heading);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Link cards */
.ks-link-card {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 100px;
}
.ks-link-top { display: flex; justify-content: space-between; align-items: flex-start; }
.ks-link-icon { font-size: 1.35rem; line-height: 1; }
.ks-link-arrow { font-size: .75rem; color: var(--ks-muted); }
.ks-link-label {
  font-size: .58rem;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--ks-muted);
  margin-bottom: .1rem;
}
.ks-link-title { font-size: .875rem; font-weight: 600; color: var(--ks-heading); }
.ks-link-desc { font-size: .75rem; color: var(--ks-muted); margin-top: .1rem; }

/* Dialog */
.ks-dialog {
  border: 1px solid var(--ks-border);
  border-radius: 16px;
  padding: 0;
  max-width: 420px;
  width: calc(100vw - 2rem);
  background: var(--ks-surface);
  color: var(--ks-text);
  box-shadow: 0 20px 60px rgba(0, 0, 0, .25);
}
.ks-dialog-inner { padding: 2rem; position: relative; }
.ks-dialog-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: .9rem;
  cursor: pointer;
  color: var(--ks-muted);
  padding: .25rem;
  line-height: 1;
}
.ks-dialog-close:hover { color: var(--ks-heading); }
.ks-dialog-title { margin: 0 0 .75rem; font-size: 1.05rem; font-weight: 700; color: var(--ks-heading); }
.ks-dialog-body { font-size: .875rem; color: var(--ks-muted); margin: 0 0 1.25rem; line-height: 1.65; }
.ks-dialog-addr {
  display: block;
  padding: .6em .85em;
  border-radius: 8px;
  background: var(--ks-soft);
  border: 1px solid var(--ks-border);
  font-size: .7rem;
  word-break: break-all;
  color: var(--ks-text);
}
.ks-dialog-thanks { font-size: .8rem; color: var(--ks-muted); margin: .75rem 0 0; text-align: center; }
</style>

<style>
/* ::backdrop can't receive scoped attribute — must be global */
.ks-dialog::backdrop {
  background: rgba(0, 0, 0, .5);
  backdrop-filter: blur(4px);
}
</style>
