<script setup>
import { ref } from 'vue'

const dialog = ref(null)
const copied = ref(false)

const KASPA_ADDRESS = 'kaspa:qypr7ayn2g55fccyv9n6gf9zgrcnpepkfgjf9d8mtfp68ezv3mgqnggxqs902q4'

async function copyAddress() {
  await navigator.clipboard.writeText(KASPA_ADDRESS)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div style="display:flex;align-items:center;">
    <button class="donate-btn" title="Support this project" @click="dialog.showModal()">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 21.593c-.425-.396-8.8-8.044-8.8-12.593C3.2 5.796 7.192 3 12 3s8.8 2.796 8.8 6c0 4.549-8.375 12.197-8.8 12.593z"/>
      </svg>
    </button>

    <dialog ref="dialog" class="donate-dialog" @click.self="dialog.close()">
      <div class="donate-inner">
        <button class="donate-close" @click="dialog.close()">✕</button>
        <p class="donate-title">Support vue-kaspa ❤️</p>
        <p class="donate-body">vue-kaspa is free and open-source. If it saves you time, consider sending some KAS — every bit helps keep the project alive and maintained.</p>
        <div class="donate-copy-wrap">
          <code class="donate-addr">{{ KASPA_ADDRESS }}</code>
          <button class="donate-copy-btn" :class="{ copied }" @click="copyAddress">
            <svg v-if="copied" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <p class="donate-thanks">Thank you for your support 🙏</p>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.donate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0 2px;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  color: var(--vp-c-text-2);
  transition: color 0.25s, background 0.25s;
}
.donate-btn:hover {
  color: #e05c8a;
  background: var(--vp-c-default-soft);
}

.donate-dialog {
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 0;
  width: min(440px, calc(100vw - 2rem));
  max-width: none;
  overflow: hidden;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, .2);
}

.donate-inner { padding: 2rem; position: relative; }

.donate-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: .9rem;
  cursor: pointer;
  color: var(--vp-c-text-3);
  padding: .25rem;
  line-height: 1;
}
.donate-close:hover { color: var(--vp-c-text-1); }

.donate-title { margin: 0 0 .75rem; font-size: 1.05rem; font-weight: 700; color: var(--vp-c-text-1); }
.donate-body { font-size: .875rem; color: var(--vp-c-text-2); margin: 0 0 1.25rem; line-height: 1.7; }

.donate-copy-wrap { display: flex; flex-direction: column; gap: .5rem; }

.donate-addr {
  display: block;
  padding: .6em .85em;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  font-size: .7rem;
  word-break: break-all;
  overflow-wrap: anywhere;
  white-space: normal;
  color: var(--vp-c-text-1);
}

.donate-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  align-self: flex-end;
  padding: .35em .75em;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: .75rem;
  cursor: pointer;
  transition: color .15s, border-color .15s;
}
.donate-copy-btn:hover { color: var(--vp-c-text-1); border-color: var(--vp-c-text-2); }
.donate-copy-btn.copied { color: #4caf50; border-color: #4caf50; }

.donate-thanks { font-size: .8rem; color: var(--vp-c-text-3); margin: .75rem 0 0; text-align: center; }
</style>

<style>
.donate-dialog::backdrop {
  background: rgba(0, 0, 0, .5);
  backdrop-filter: blur(4px);
}
</style>
