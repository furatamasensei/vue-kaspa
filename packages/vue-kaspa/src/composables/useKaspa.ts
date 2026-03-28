import { computed, readonly } from 'vue'
import { inject } from 'vue'
import { getWasmState, ensureWasmInit, resetWasm } from '../internal/wasm-loader'
import { KASPA_OPTIONS_KEY } from '../symbols'
import type { KaspaPluginOptions, UseKaspaReturn } from '../types'

export function useKaspa(): UseKaspaReturn {
  const options = inject<KaspaPluginOptions>(KASPA_OPTIONS_KEY, {})
  const state = getWasmState()

  return {
    wasmStatus: readonly(
      // shallowReactive field — expose as ref-like via computed
      computed(() => state.status),
    ) as UseKaspaReturn['wasmStatus'],
    wasmError: readonly(
      computed(() => state.error),
    ) as UseKaspaReturn['wasmError'],
    isReady: computed(() => state.status === 'ready'),

    async init(): Promise<void> {
      await ensureWasmInit(options)
    },

    reset(): void {
      resetWasm()
    },
  }
}
