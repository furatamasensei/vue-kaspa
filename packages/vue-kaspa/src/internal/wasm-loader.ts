import { shallowReactive } from 'vue'
import type { KaspaPluginOptions, WasmStatus } from '../types'
import { loadKaspa, resetKaspa } from './kaspa'

interface WasmState {
  status: WasmStatus
  error: Error | null
}

const state = shallowReactive<WasmState>({
  status: 'idle',
  error: null,
})

let initPromise: Promise<void> | null = null

export function getWasmState(): Readonly<WasmState> {
  return state
}

export async function ensureWasmInit(options: KaspaPluginOptions): Promise<void> {
  if (state.status === 'ready') return
  if (initPromise) return initPromise

  state.status = 'loading'
  state.error = null

  initPromise = (async () => {
    const mod = await loadKaspa()
    await mod.default()

    if (options.panicHook === 'browser') {
      mod.initBrowserPanicHook()
    } else if (options.panicHook !== false) {
      mod.initConsolePanicHook()
    }

    state.status = 'ready'
  })().catch((err: unknown) => {
    state.status = 'error'
    state.error = err instanceof Error ? err : new Error(String(err))
    initPromise = null
    throw state.error
  })

  return initPromise
}

export function resetWasm(): void {
  state.status = 'idle'
  state.error = null
  initPromise = null
  resetKaspa()
}
