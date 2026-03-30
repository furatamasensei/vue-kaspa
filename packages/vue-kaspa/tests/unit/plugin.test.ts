import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp } from 'vue'
import { VueKaspa } from '../../src/plugin'
import { KASPA_OPTIONS_KEY, KASPA_INSTALLED_KEY } from '../../src/symbols'
import { resetRpcManager } from '../../src/internal/rpc-manager'
import { resetWasm } from '../../src/internal/wasm-loader'

function createTestApp(options = {}) {
  const app = createApp({ template: '<div />' })
  app.use(VueKaspa, options)
  return app
}

describe('VueKaspa', () => {
  beforeEach(() => {
    resetRpcManager()
    resetWasm()
  })

  it('provides KASPA_OPTIONS_KEY with defaults', () => {
    const app = createTestApp()
    const options = app._context.provides[KASPA_OPTIONS_KEY as unknown as string]
    expect(options).toBeDefined()
    expect(options.network).toBe('mainnet')
    expect(options.encoding).toBe('Borsh')
    expect(options.autoConnect).toBe(true)
    expect(options.panicHook).toBe('console')
  })

  it('respects user-provided options', () => {
    const app = createTestApp({ network: 'testnet-10', url: 'ws://localhost:17110' })
    const options = app._context.provides[KASPA_OPTIONS_KEY as unknown as string]
    expect(options.network).toBe('testnet-10')
    expect(options.url).toBe('ws://localhost:17110')
  })

  it('marks app as installed', () => {
    const app = createTestApp()
    expect(app._context.provides[KASPA_INSTALLED_KEY as unknown as string]).toBe(true)
  })

  it('does not install twice on the same app', () => {
    const app = createTestApp()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    app.use(VueKaspa, {})
    // Vue itself (or our guard) should emit a warning on duplicate install
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('resolver defaults to true when no url is provided', () => {
    const app = createTestApp({ url: undefined })
    const options = app._context.provides[KASPA_OPTIONS_KEY as unknown as string]
    expect(options.resolver).toBe(true)
  })

  it('resolver defaults to false when url is provided', () => {
    const app = createTestApp({ url: 'ws://localhost:17110' })
    const options = app._context.provides[KASPA_OPTIONS_KEY as unknown as string]
    expect(options.resolver).toBe(false)
  })
})
