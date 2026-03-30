<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWallet } from '../composables/useWallet'
import type { WalletProvider } from '../types'

// ─── Props ─────────────────────────────────────────────────────────────────

interface Props {
  /** Wallet providers to offer. Default: ['kasware', 'kastle'] */
  wallets?: WalletProvider[]
  /**
   * Network to connect Kastle to.
   * Ignored for KasWare (uses wallet's active network).
   * Default: 'mainnet'
   */
  network?: string
  /** Button label when no wallet is connected. Default: 'Connect Wallet' */
  label?: string
  /** Show KAS balance in the connected dropdown. Default: false */
  showBalance?: boolean
  /** Show network badge next to address. Default: true */
  showNetwork?: boolean
  /** Number of address characters to show at each end. Default: 6 */
  truncate?: number
}

const props = withDefaults(defineProps<Props>(), {
  wallets: () => ['kasware', 'kastle'],
  network: 'mainnet',
  label: 'Connect Wallet',
  showBalance: false,
  showNetwork: true,
  truncate: 6,
})

// ─── Emits ─────────────────────────────────────────────────────────────────

const emit = defineEmits<{
  /** Fires once a wallet is successfully connected */
  connected: [payload: { provider: WalletProvider; address: string; publicKey: string }]
  /** Fires once the wallet is disconnected */
  disconnected: []
  /** Fires when a connection attempt fails */
  error: [err: Error]
}>()

// ─── Wallet state ──────────────────────────────────────────────────────────

const wallet = useWallet()

// ─── Menu state ────────────────────────────────────────────────────────────

const selectOpen = ref(false)
const connectedOpen = ref(false)
const root = ref<HTMLElement | null>(null)

function closeAll() {
  selectOpen.value = false
  connectedOpen.value = false
}

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) {
    closeAll()
  }
}

onMounted(() => document.addEventListener('click', onDocClick, true))
onUnmounted(() => document.removeEventListener('click', onDocClick, true))

// ─── Wallet metadata ───────────────────────────────────────────────────────

const WALLET_META: Record<WalletProvider, { name: string; installUrl: string }> = {
  kasware: { name: 'KasWare', installUrl: 'https://kasware.xyz' },
  kastle: { name: 'Kastle', installUrl: 'https://kastle.cc' },
}

const resolvedWallets = computed(() =>
  props.wallets.map((id) => ({
    id,
    ...WALLET_META[id],
    isInstalled: id === 'kasware' ? wallet.isKaswareInstalled.value : wallet.isKastleInstalled.value,
  })),
)

// ─── Display helpers ────────────────────────────────────────────────────────

const truncatedAddress = computed(() => {
  const addr = wallet.address.value
  if (!addr) return ''
  if (addr.length <= props.truncate * 2 + 3) return addr
  return `${addr.slice(0, props.truncate)}…${addr.slice(-props.truncate)}`
})

const formattedBalance = computed(() => {
  const b = wallet.balance.value
  if (!b) return null
  const sompi = b.total
  const kas = Number(sompi) / 1e8
  return kas.toLocaleString(undefined, { maximumFractionDigits: 4 })
})

const connectedSlotProps = computed(() => ({
  provider: wallet.provider.value,
  address: wallet.address.value,
  publicKey: wallet.publicKey.value,
  balance: wallet.balance.value,
  network: wallet.network.value,
  truncatedAddress: truncatedAddress.value,
  disconnect: handleDisconnect,
}))

// ─── Actions ───────────────────────────────────────────────────────────────

async function handleConnect(provider: WalletProvider) {
  selectOpen.value = false
  try {
    await wallet.connect(provider, props.network)
    emit('connected', {
      provider,
      address: wallet.address.value!,
      publicKey: wallet.publicKey.value!,
    })
  } catch (err) {
    emit('error', err instanceof Error ? err : new Error(String(err)))
  }
}

async function handleDisconnect() {
  connectedOpen.value = false
  await wallet.disconnect()
  emit('disconnected')
}
</script>

<template>
  <div ref="root" class="ks-cw">

    <!-- ── Not connected ───────────────────────────────────────────── -->
    <template v-if="!wallet.isConnected.value">
      <slot name="trigger" :open="selectOpen" :toggle="() => (selectOpen = !selectOpen)">
        <button
          class="ks-cw-btn"
          :disabled="wallet.isConnecting.value"
          @click="selectOpen = !selectOpen"
        >
          <span v-if="wallet.isConnecting.value" class="ks-cw-spinner" aria-hidden="true" />
          {{ wallet.isConnecting.value ? 'Connecting…' : label }}
        </button>
      </slot>

      <div v-if="selectOpen" class="ks-cw-menu" role="menu">
        <p class="ks-cw-menu-heading">Select a wallet</p>

        <button
          v-for="w in resolvedWallets"
          :key="w.id"
          class="ks-cw-option"
          :class="{ 'ks-cw-option--unavailable': !w.isInstalled }"
          role="menuitem"
          :disabled="!w.isInstalled"
          @click="w.isInstalled && handleConnect(w.id)"
        >
          <slot :name="`icon-${w.id}`">
            <span class="ks-cw-option-icon" aria-hidden="true">
              <!-- KasWare default icon -->
              <svg v-if="w.id === 'kasware'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 22 7 22 17 12 22 2 17 2 7" />
                <polyline points="12 2 12 22" />
                <polyline points="2 7 22 7" />
                <polyline points="2 17 22 17" />
              </svg>
              <!-- Kastle default icon -->
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 21V9l9-7 9 7v12" />
                <path d="M9 21v-6h6v6" />
                <path d="M9 9h6" />
              </svg>
            </span>
          </slot>

          <span class="ks-cw-option-body">
            <span class="ks-cw-option-name">{{ w.name }}</span>
            <span v-if="!w.isInstalled" class="ks-cw-option-hint">
              Not installed —
              <a :href="w.installUrl" target="_blank" rel="noopener noreferrer" @click.stop>Install</a>
            </span>
          </span>

          <span v-if="w.isInstalled" class="ks-cw-option-arrow" aria-hidden="true">›</span>
        </button>
      </div>
    </template>

    <!-- ── Connected ──────────────────────────────────────────────── -->
    <template v-else>
      <slot name="connected" v-bind="connectedSlotProps">
        <button class="ks-cw-connected-btn" @click="connectedOpen = !connectedOpen">
          <span v-if="showNetwork && wallet.network.value" class="ks-cw-badge">
            {{ wallet.network.value }}
          </span>
          <span class="ks-cw-address">{{ truncatedAddress }}</span>
          <span class="ks-cw-chevron" :class="{ 'ks-cw-chevron--open': connectedOpen }" aria-hidden="true">›</span>
        </button>

        <div v-if="connectedOpen" class="ks-cw-menu ks-cw-menu--connected" role="menu">
          <div v-if="showBalance && formattedBalance !== null" class="ks-cw-balance">
            <span class="ks-cw-balance-amount">{{ formattedBalance }}</span>
            <span class="ks-cw-balance-unit">KAS</span>
          </div>
          <div class="ks-cw-address-full">{{ wallet.address.value }}</div>
          <button class="ks-cw-disconnect-btn" role="menuitem" @click="handleDisconnect">
            Disconnect
          </button>
        </div>
      </slot>
    </template>

    <!-- Error message (visible when wallet.error is set) -->
    <p v-if="wallet.error.value" class="ks-cw-error" role="alert">
      {{ wallet.error.value.message }}
    </p>
  </div>
</template>

<style scoped>
/* ── Root ─────────────────────────────────────────────────────────── */
.ks-cw {
  position: relative;
  display: inline-block;
  font-family: inherit;
  font-size: 0.875rem;
}

/* ── Connect button ────────────────────────────────────────────────── */
.ks-cw-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--ks-border, #e4e4e7);
  background: var(--ks-surface, #fff);
  color: var(--ks-text, #3f3f46);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s;
}
.ks-cw-btn:hover:not(:disabled) {
  background: var(--ks-soft, #f4f4f5);
  border-color: var(--ks-accent, #49c5a3);
}
.ks-cw-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Spinner ─────────────────────────────────────────────────────── */
.ks-cw-spinner {
  display: inline-block;
  width: 0.875rem;
  height: 0.875rem;
  border: 2px solid var(--ks-border, #e4e4e7);
  border-top-color: var(--ks-accent, #49c5a3);
  border-radius: 50%;
  animation: ks-cw-spin 0.6s linear infinite;
}
@keyframes ks-cw-spin { to { transform: rotate(360deg); } }

/* ── Dropdown menu ────────────────────────────────────────────────── */
.ks-cw-menu {
  position: absolute;
  top: calc(100% + 0.375rem);
  left: 0;
  z-index: 50;
  min-width: 220px;
  padding: 0.375rem;
  border-radius: 0.625rem;
  border: 1px solid var(--ks-border, #e4e4e7);
  background: var(--ks-surface, #fff);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.ks-cw-menu-heading {
  margin: 0;
  padding: 0.375rem 0.625rem 0.25rem;
  font-size: 0.75rem;
  color: var(--ks-muted, #a1a1aa);
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ── Wallet option ────────────────────────────────────────────────── */
.ks-cw-option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border-radius: 0.375rem;
  border: none;
  background: transparent;
  color: var(--ks-text, #3f3f46);
  font-size: 0.875rem;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s;
}
.ks-cw-option:hover:not(.ks-cw-option--unavailable) {
  background: var(--ks-soft, #f4f4f5);
}
.ks-cw-option--unavailable {
  cursor: default;
  opacity: 0.55;
}

.ks-cw-option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.375rem;
  background: var(--ks-soft, #f4f4f5);
  flex-shrink: 0;
  color: var(--ks-accent, #49c5a3);
}
.ks-cw-option-icon svg {
  width: 1rem;
  height: 1rem;
}

.ks-cw-option-body {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
  min-width: 0;
}
.ks-cw-option-name {
  font-weight: 500;
  color: var(--ks-heading, #18181b);
}
.ks-cw-option-hint {
  font-size: 0.75rem;
  color: var(--ks-muted, #a1a1aa);
}
.ks-cw-option-hint a {
  color: var(--ks-accent, #49c5a3);
  text-decoration: none;
}
.ks-cw-option-hint a:hover { text-decoration: underline; }

.ks-cw-option-arrow {
  margin-left: auto;
  color: var(--ks-muted, #a1a1aa);
  font-size: 1.125rem;
  line-height: 1;
}

/* ── Connected button ─────────────────────────────────────────────── */
.ks-cw-connected-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--ks-border, #e4e4e7);
  background: var(--ks-surface, #fff);
  color: var(--ks-text, #3f3f46);
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.ks-cw-connected-btn:hover {
  background: var(--ks-soft, #f4f4f5);
  border-color: var(--ks-accent, #49c5a3);
}

.ks-cw-badge {
  padding: 0.125rem 0.4rem;
  border-radius: 0.25rem;
  background: color-mix(in srgb, var(--ks-accent, #49c5a3) 15%, transparent);
  color: var(--ks-accent, #49c5a3);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.ks-cw-address {
  font-family: ui-monospace, monospace;
  font-size: 0.8125rem;
}

.ks-cw-chevron {
  display: inline-block;
  color: var(--ks-muted, #a1a1aa);
  font-size: 1rem;
  line-height: 1;
  transition: transform 0.15s;
}
.ks-cw-chevron--open { transform: rotate(90deg); }

/* ── Connected dropdown ───────────────────────────────────────────── */
.ks-cw-menu--connected {
  min-width: 260px;
  padding: 0.5rem;
}

.ks-cw-balance {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  padding: 0.375rem 0.625rem 0.25rem;
  border-bottom: 1px solid var(--ks-border, #e4e4e7);
  margin-bottom: 0.25rem;
}
.ks-cw-balance-amount {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ks-heading, #18181b);
  font-family: ui-monospace, monospace;
}
.ks-cw-balance-unit {
  font-size: 0.75rem;
  color: var(--ks-muted, #a1a1aa);
  font-weight: 500;
}

.ks-cw-address-full {
  padding: 0.25rem 0.625rem;
  font-size: 0.7rem;
  font-family: ui-monospace, monospace;
  color: var(--ks-muted, #a1a1aa);
  word-break: break-all;
  border-bottom: 1px solid var(--ks-border, #e4e4e7);
  margin-bottom: 0.25rem;
}

.ks-cw-disconnect-btn {
  display: block;
  width: 100%;
  padding: 0.4375rem 0.625rem;
  border-radius: 0.375rem;
  border: none;
  background: transparent;
  color: #ef4444;
  font-size: 0.875rem;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s;
}
.ks-cw-disconnect-btn:hover {
  background: color-mix(in srgb, #ef4444 10%, transparent);
}

/* ── Error ────────────────────────────────────────────────────────── */
.ks-cw-error {
  margin: 0.375rem 0 0;
  font-size: 0.75rem;
  color: #ef4444;
}
</style>
