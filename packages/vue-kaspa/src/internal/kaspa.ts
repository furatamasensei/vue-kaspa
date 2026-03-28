/**
 * Single access point for @vue-kaspa/kaspa-wasm.
 *
 * Uses globalThis as the backing store so the singleton survives across
 * chunk boundaries. When the bundler duplicates this module into multiple
 * chunks (rpc-manager, main entry, etc.), all copies share the same
 * reference via globalThis, preventing class identity mismatches.
 */

type KaspaModule = typeof import('@vue-kaspa/kaspa-wasm')

const KASPA_KEY = '__vue_kaspa_wasm__'

export async function loadKaspa(): Promise<KaspaModule> {
  if (!(globalThis as Record<string, unknown>)[KASPA_KEY]) {
    ;(globalThis as Record<string, unknown>)[KASPA_KEY] = await import('@vue-kaspa/kaspa-wasm')
  }
  return (globalThis as Record<string, unknown>)[KASPA_KEY] as KaspaModule
}

export function getKaspa(): KaspaModule {
  const mod = (globalThis as Record<string, unknown>)[KASPA_KEY]
  if (!mod) throw new Error('kaspa-wasm is not loaded yet. Call ensureWasmInit() first.')
  return mod as KaspaModule
}

export function resetKaspa(): void {
  delete (globalThis as Record<string, unknown>)[KASPA_KEY]
}
