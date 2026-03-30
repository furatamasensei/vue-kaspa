<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  packages: string
  dev?: boolean
}>(), { dev: false })

type PM = 'npm' | 'pnpm' | 'yarn' | 'bun'
const managers: PM[] = ['npm', 'pnpm', 'yarn', 'bun']
const STORAGE_KEY = 'vkas-pm'

const selected = ref<PM>('npm')

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY) as PM | null
  if (saved && managers.includes(saved)) selected.value = saved
})

function select(pm: PM) {
  selected.value = pm
  localStorage.setItem(STORAGE_KEY, pm)
}

const command = computed(() => {
  const pkgs = props.packages
  const d = props.dev
  switch (selected.value) {
    case 'npm':  return `npm install${d ? ' -D' : ''} ${pkgs}`
    case 'pnpm': return `pnpm add${d ? ' -D' : ''} ${pkgs}`
    case 'yarn': return `yarn add${d ? ' -D' : ''} ${pkgs}`
    case 'bun':  return `bun add${d ? ' -d' : ''} ${pkgs}`
  }
})

const copied = ref(false)
async function copy() {
  await navigator.clipboard.writeText(command.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="pm-wrap">
    <div class="pm-tabs">
      <button
        v-for="pm in managers"
        :key="pm"
        class="pm-tab"
        :class="{ active: selected === pm }"
        @click="select(pm)"
      >
        <!-- npm -->
        <svg v-if="pm === 'npm'" viewBox="0 0 24 10" width="28" height="12" aria-hidden="true">
          <rect width="24" height="10" rx="2" fill="#CB3837"/>
          <path d="M4.5 2H1.5v6h3V3.5h1v4.5h1.5V2H4.5zm5.5 0H7v6h1.5V3.5h1v3.5H11V3.5h1v3H11v1.5h3V2h-4zm6 0H13v6h4.5V2h-1.5zm-1 4.5V3.5h1v3h-1z" fill="#fff"/>
        </svg>
        <!-- pnpm -->
        <svg v-else-if="pm === 'pnpm'" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <rect x="0"  y="0"  width="6" height="6" rx="1" fill="#F69220"/>
          <rect x="7"  y="0"  width="6" height="6" rx="1" fill="#F69220"/>
          <rect x="14" y="0"  width="6" height="6" rx="1" fill="#4E4E4E"/>
          <rect x="0"  y="7"  width="6" height="6" rx="1" fill="#F69220"/>
          <rect x="7"  y="7"  width="6" height="6" rx="1" fill="#F69220"/>
          <rect x="14" y="7"  width="6" height="6" rx="1" fill="#F69220"/>
          <rect x="0"  y="14" width="6" height="6" rx="1" fill="#4E4E4E"/>
          <rect x="7"  y="14" width="6" height="6" rx="1" fill="#4E4E4E"/>
          <rect x="14" y="14" width="6" height="6" rx="1" fill="#F69220"/>
        </svg>
        <!-- yarn -->
        <svg v-else-if="pm === 'yarn'" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <circle cx="10" cy="10" r="10" fill="#2C8EBB"/>
          <path d="M14.3 6.2c-.4-.8-1.2-.8-1.7-.4-1 .7-1.5 1.8-1.9 2.9-.3.7-.4 1.4-.7 2-.1.2-.2.4-.4.4s-.3-.2-.3-.4V8.5c0-1.1-.4-2.5-1.6-2.5-.7 0-1.2.4-1.5.9-.3.5-.3 1.2 0 1.8.4.8.9 1.5 1.4 2.2.5.7 1 1.5 1 2.4 0 .4-.1.8-.4 1.1.6 0 1.1-.1 1.5-.4.4-.3.7-.7.8-1.1.6-1.4.7-2.9 1.4-4.2.3-.6.7-1.1 1.3-1.2.5-.2 1 .1 1.2.5.3.4.1 1-.2 1.2z" fill="#fff"/>
        </svg>
        <!-- bun -->
        <svg v-else-if="pm === 'bun'" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <ellipse cx="10" cy="11" rx="8" ry="7" fill="#FBF0DF"/>
          <ellipse cx="10" cy="11" rx="7" ry="5.5" fill="#F6DECE"/>
          <ellipse cx="7"  cy="8"  rx="2.5" ry="3"   fill="#F9D77E"/>
          <ellipse cx="13" cy="8"  rx="2.5" ry="3"   fill="#F9D77E"/>
          <ellipse cx="10" cy="7.5" rx="3"  ry="3.2" fill="#F9D77E"/>
          <circle  cx="8.5" cy="7" r=".6" fill="#4a3728"/>
          <circle  cx="11.5" cy="7" r=".6" fill="#4a3728"/>
        </svg>
        <span>{{ pm }}</span>
      </button>
      <span class="pm-lang">sh</span>
    </div>
    <div class="pm-body">
      <span class="pm-prompt">$</span>
      <span class="pm-cmd">{{ command }}</span>
      <button class="pm-copy" :class="{ ok: copied }" :title="copied ? 'Copied!' : 'Copy'" @click="copy">
        <svg v-if="copied" viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 4 6.5 11 3 7.5"/>
        </svg>
        <svg v-else viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="5" y="5" width="9" height="9" rx="1.5"/>
          <path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.pm-wrap {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--vp-code-block-divider-color, #e2e2e3);
}

.dark .pm-wrap {
  border-color: #2e2e32;
}

/* ── Tab bar ─────────────────────────────────── */
.pm-tabs {
  display: flex;
  align-items: center;
  background: var(--vp-code-tab-bg, #f6f6f7);
  border-bottom: 1px solid var(--vp-code-block-divider-color, #e2e2e3);
  padding: 0 12px;
  gap: 2px;
}

.dark .pm-tabs {
  background: #1e1e20;
  border-bottom-color: #2e2e32;
}

.pm-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px 6px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.15s;
  white-space: nowrap;
  margin-bottom: -1px;
}

.pm-tab:hover {
  color: var(--vp-c-text-1);
}

.pm-tab.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.pm-lang {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  padding: 0 4px;
}

/* ── Command body ─────────────────────────────── */
.pm-body {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: var(--vp-code-block-bg, #f6f6f7);
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  line-height: 1.5;
}

.dark .pm-body {
  background: #161618;
}

.pm-prompt {
  color: var(--vp-c-brand-1);
  user-select: none;
  flex-shrink: 0;
}

.pm-cmd {
  flex: 1;
  color: var(--vp-code-color, #3b3b3f);
  word-break: break-all;
}

.dark .pm-cmd {
  color: #dbd7caee;
}

.pm-copy {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 5px;
  border: 1px solid var(--vp-code-block-divider-color, #e2e2e3);
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.pm-copy:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-text-2);
}

.pm-copy.ok {
  color: #4caf50;
  border-color: #4caf50;
}

.dark .pm-copy {
  border-color: #3e3e42;
}
</style>
