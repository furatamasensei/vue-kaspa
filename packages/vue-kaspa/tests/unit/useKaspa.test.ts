import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { mockWasmInit } from '../mocks/kaspa-wasm'
import { KaspaPlugin } from '../../src/plugin'
import { useKaspa } from '../../src/composables/useKaspa'
import { resetWasm } from '../../src/internal/wasm-loader'

function mountUseKaspa(pluginOptions = {}) {
  let result: ReturnType<typeof useKaspa>
  const TestComponent = defineComponent({
    setup() {
      result = useKaspa()
      return () => null
    },
  })
  const wrapper = mount(TestComponent, {
    global: { plugins: [[KaspaPlugin, { autoConnect: false, ...pluginOptions }]] },
    attachTo: document.body,
  })
  return { wrapper, get kaspa() { return result } }
}

describe('useKaspa', () => {
  beforeEach(() => {
    resetWasm()
  })

  it('starts in idle state', () => {
    const { kaspa } = mountUseKaspa()
    expect(kaspa.wasmStatus.value).toBe('idle')
    expect(kaspa.isReady.value).toBe(false)
    expect(kaspa.wasmError.value).toBeNull()
  })

  it('transitions to ready after init()', async () => {
    const { kaspa } = mountUseKaspa()
    await kaspa.init()
    expect(kaspa.wasmStatus.value).toBe('ready')
    expect(kaspa.isReady.value).toBe(true)
  })

  it('init() is idempotent', async () => {
    const { kaspa } = mountUseKaspa()
    await kaspa.init()
    await kaspa.init()
    expect(mockWasmInit).toHaveBeenCalledTimes(1)
  })

  it('sets error state on WASM init failure', async () => {
    mockWasmInit.mockRejectedValueOnce(new Error('fetch failed'))
    const { kaspa } = mountUseKaspa()
    await expect(kaspa.init()).rejects.toThrow('fetch failed')
    expect(kaspa.wasmStatus.value).toBe('error')
    expect(kaspa.wasmError.value).toBeInstanceOf(Error)
  })

  it('reset() clears error and returns to idle', async () => {
    mockWasmInit.mockRejectedValueOnce(new Error('fetch failed'))
    const { kaspa } = mountUseKaspa()
    await expect(kaspa.init()).rejects.toThrow()
    kaspa.reset()
    expect(kaspa.wasmStatus.value).toBe('idle')
    expect(kaspa.wasmError.value).toBeNull()
  })

  it('multiple components share the same singleton state', async () => {
    const results: ReturnType<typeof useKaspa>[] = []
    const TestComponent = defineComponent({
      setup() {
        results.push(useKaspa())
        return () => null
      },
    })
    const wrapper = mount({
      components: { TestComponent },
      template: '<TestComponent /><TestComponent />',
    }, {
      global: { plugins: [[KaspaPlugin, { autoConnect: false }]] },
    })
    await flushPromises()
    // Both instances point to the same reactive state
    expect(results[0].wasmStatus.value).toBe(results[1].wasmStatus.value)
    // Init from one reflects in the other
    await results[0].init()
    expect(results[1].isReady.value).toBe(true)
    wrapper.unmount()
  })
})
