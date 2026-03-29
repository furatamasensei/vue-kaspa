<script setup lang="ts">
import { ArrowUpRight, BookOpen, Check, Copy, Droplet, Heart, Search } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useKaspa, useRpc } from 'vue-kaspa'

const kaspa = useKaspa()
const rpc = useRpc()
const bento = ref<HTMLElement | null>(null)
const donateDialog = ref<HTMLDialogElement | null>(null)
const copied = ref(false)

const KASPA_ADDRESS = 'kaspa:qypr7ayn2g55fccyv9n6gf9zgrcnpepkfgjf9d8mtfp68ezv3mgqnggxqs902q4'

async function copyAddress() {
  await navigator.clipboard.writeText(KASPA_ADDRESS)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

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
  { label: 'Faucet',   title: 'Testnet 10', desc: 'Get free test KAS',    icon: Droplet,    href: 'https://faucet-tn10.kaspanet.io/' },
  { label: 'Faucet',   title: 'Testnet 12', desc: 'Get free test KAS',    icon: Droplet,    href: 'https://faucet-tn12.kaspanet.io/' },
  { label: 'Docs',     title: 'VKAS',  desc: 'Read the full docs',   icon: BookOpen,   href: 'https://vue-kaspa.vercel.app/' },
  { label: 'Explorer', title: 'Testnet 10', desc: 'Browse transactions',  icon: Search,     href: 'https://tn10.kaspa.stream/' },
  { label: 'Explorer', title: 'Testnet 12', desc: 'Browse transactions',  icon: Search,     href: 'https://tn12.kaspa.stream/' },
  { label: 'Explorer', title: 'Mainnet',    desc: 'Browse transactions',  icon: Search,     href: 'https://kaspa.stream/' },
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
  <dialog ref="donateDialog" class="dialog" @click.self="donateDialog?.close()">
    <div class="dialog-inner">
      <button class="dialog-close" @click="donateDialog?.close()">✕</button>
      <p class="dialog-title">Support VKAS ❤️</p>
      <p class="dialog-body">VKAS is free and open-source. If it saves you time, consider sending some KAS — every bit helps keep the project alive and maintained.</p>
      <div class="copy-wrap">
        <code class="dialog-addr">{{ KASPA_ADDRESS }}</code>
        <button class="copy-btn" :class="{ copied }" @click="copyAddress">
          <Check v-if="copied" :size="13" />
          <Copy v-else :size="13" />
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <p class="dialog-thanks">Thank you for your support 🙏</p>
    </div>
  </dialog>

  <div class="root">

    <!-- Header -->
    <header class="header">
      <img src="/logo.png" alt="VKAS" class="header-logo" />
      <span class="header-brand">VKAS</span>
      <nav class="header-nav">
        <a
          href="https://github.com/furatamasensei/vue-kaspa"
          target="_blank"
          rel="noopener"
          class="icon-btn"
          title="GitHub"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
        </a>
        <button class="icon-btn" title="Support this project" @click="donateDialog?.showModal()">
          <Heart :size="18" />
        </button>
      </nav>
    </header>

    <!-- Bento grid -->
    <div ref="bento" class="grid">

        <!-- Network card: col 1–2, row 1–3 -->
        <div data-shine class="shine net-shine">
          <div class="card net-card">
            <div class="net-top">
              <span class="net-icon">⬡</span>
              <span class="badge" :style="`border-color:${badgeColor};color:${badgeColor}`">{{ stateLabel }}</span>
            </div>
            <div class="stats">
              <div class="stat">
                <span class="stat-label">Network</span>
                <span class="stat-value">{{ rpc.networkId.value ?? '—' }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Server version</span>
                <span class="stat-value">{{ rpc.serverVersion.value ?? '—' }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">DAA Score</span>
                <span class="stat-value mono">{{ daaScore }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Synced</span>
                <span
                  class="stat-value"
                  :style="`color:${rpc.isConnected.value ? (rpc.isSynced.value ? '#4caf50' : 'var(--ks-text)') : 'var(--ks-muted)'}`"
                >{{ rpc.isConnected.value ? (rpc.isSynced.value ? 'Yes' : 'Syncing…') : '—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Link cards: auto-placed into Γ shape -->
        <a
          v-for="link in links"
          :key="link.href"
          data-shine
          class="shine link-shine"
          :href="link.href"
          target="_blank"
          rel="noopener"
        >
          <div class="card link-card">
            <div class="link-top">
              <component :is="link.icon" :size="20" class="link-icon" />
              <ArrowUpRight :size="13" class="link-arrow" />
            </div>
            <div>
              <div class="link-label">{{ link.label }}</div>
              <div class="link-title">{{ link.title }}</div>
              <div class="link-desc">{{ link.desc }}</div>
            </div>
          </div>
        </a>

      </div>
  </div>
</template>

<style scoped>
/* Root */
.root { width: 100%; font-family: Inter, system-ui, -apple-system, sans-serif; }

/* Header */
.header { display: flex; align-items: center; gap: .6rem; margin-bottom: .75rem; }
.header-logo { width: 28px; height: 28px; object-fit: contain; }
.header-brand { font-size: 1rem; font-weight: 700; color: var(--ks-heading); flex: 1; }
.header-nav { display: flex; gap: .15rem; }

.icon-btn {
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
  transition: color .15s, background .15s;
}
.icon-btn:hover { color: var(--ks-heading); background: var(--ks-border); }

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .75rem;
}

/* Shine wrapper */
.shine {
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
.net-shine { grid-column: 1 / span 2; grid-row: 1 / span 3; }

/* Card base */
.card { border-radius: 13px; background: var(--ks-soft); height: 100%; }

/* Network card */
.net-card { padding: 1.75rem; display: flex; flex-direction: column; gap: 1.5rem; min-height: 320px; }
.net-top { display: flex; align-items: center; justify-content: space-between; }
.net-icon { font-size: 2.25rem; color: var(--ks-accent); line-height: 1; }
.badge { font-size: .7rem; font-weight: 500; padding: .2em .6em; border-radius: 999px; border: 1px solid; white-space: nowrap; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem; }
.stat { display: flex; flex-direction: column; gap: .25rem; }
.stat-label { font-size: .65rem; text-transform: uppercase; letter-spacing: .06em; color: var(--ks-muted); }
.stat-value { font-size: .95rem; color: var(--ks-heading); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mono { font-family: monospace; }

/* Link cards */
.link-card { padding: 1rem; display: flex; flex-direction: column; justify-content: space-between; gap: .5rem; min-height: 100px; }
.link-top { display: flex; justify-content: space-between; align-items: flex-start; }
.link-icon { color: var(--ks-accent); }
.link-arrow { color: var(--ks-muted); }
.link-label { font-size: .58rem; text-transform: uppercase; letter-spacing: .06em; color: var(--ks-muted); margin-bottom: .1rem; }
.link-title { font-size: .875rem; font-weight: 600; color: var(--ks-heading); }
.link-desc { font-size: .75rem; color: var(--ks-muted); margin-top: .1rem; }

/* Dialog */
.dialog {
  border: 1px solid var(--ks-border);
  border-radius: 16px;
  padding: 0;
  width: min(440px, calc(100vw - 2rem));
  max-width: none;
  overflow: hidden;
  background: var(--ks-surface);
  color: var(--ks-text);
  box-shadow: 0 20px 60px rgba(0, 0, 0, .25);
}
.dialog-inner { padding: 2rem; position: relative; }
.dialog-close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: .9rem; cursor: pointer; color: var(--ks-muted); padding: .25rem; line-height: 1; }
.dialog-close:hover { color: var(--ks-heading); }
.dialog-title { margin: 0 0 .75rem; font-size: 1.05rem; font-weight: 700; color: var(--ks-heading); }
.dialog-body { font-size: .875rem; color: var(--ks-muted); margin: 0 0 1.25rem; line-height: 1.65; }

.copy-wrap { display: flex; flex-direction: column; gap: .5rem; }
.dialog-addr {
  display: block;
  padding: .6em .85em;
  border-radius: 8px;
  background: var(--ks-soft);
  border: 1px solid var(--ks-border);
  font-size: .7rem;
  word-break: break-all;
  overflow-wrap: anywhere;
  white-space: normal;
  color: var(--ks-text);
}
.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  align-self: flex-end;
  padding: .35em .75em;
  border-radius: 6px;
  border: 1px solid var(--ks-border);
  background: var(--ks-soft);
  color: var(--ks-muted);
  font-size: .75rem;
  cursor: pointer;
  transition: color .15s, border-color .15s;
}
.copy-btn:hover { color: var(--ks-heading); border-color: var(--ks-heading); }
.copy-btn.copied { color: #4caf50; border-color: #4caf50; }

.dialog-thanks { font-size: .8rem; color: var(--ks-muted); margin: .75rem 0 0; text-align: center; }
</style>

<style>
.dialog::backdrop {
  background: rgba(0, 0, 0, .5);
  backdrop-filter: blur(4px);
}
</style>
