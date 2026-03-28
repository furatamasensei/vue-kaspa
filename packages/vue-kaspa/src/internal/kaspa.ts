/**
 * Single access point for @vue-kaspa/kaspa-wasm.
 *
 * Keeping all imports through one dynamic import prevents bundlers (Rolldown/Vite 8)
 * from creating multiple evaluations of the WASM module, which would cause class
 * identity mismatches (e.g. `instanceof Resolver` failing across chunks).
 */

type KaspaModule = typeof import('@vue-kaspa/kaspa-wasm')

let _mod: KaspaModule | null = null

export async function loadKaspa(): Promise<KaspaModule> {
  if (!_mod) _mod = await import('@vue-kaspa/kaspa-wasm')
  return _mod
}

export function getKaspa(): KaspaModule {
  if (!_mod) throw new Error('kaspa-wasm is not loaded yet. Call ensureWasmInit() first.')
  return _mod
}

export function resetKaspa(): void {
  _mod = null
}
