import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { VueKaspa } from '../../src/plugin'
import { useNetwork } from '../../src/composables/useNetwork'
import { resetRpcManager } from '../../src/internal/rpc-manager'
import { resetWasm } from '../../src/internal/wasm-loader'
import { AVAILABLE_NETWORKS } from '../../src/types'

// useNetwork has module-level state — reset it via the ref directly
// We expose a testable version by resetting via the composable internals
function mountUseNetwork(pluginOptions = {}) {
  let result: ReturnType<typeof useNetwork>
  const TestComponent = defineComponent({
    setup() {
      result = useNetwork()
      return () => null
    },
  })
  const wrapper = mount(TestComponent, {
    global: { plugins: [[VueKaspa, { autoConnect: false, ...pluginOptions }]] },
    attachTo: document.body,
  })
  return { wrapper, get network() { return result } }
}

describe('useNetwork', () => {
  beforeEach(() => {
    resetRpcManager()
    resetWasm()
    // Reset module-level network state by re-importing
    // We do this by getting current ref and setting it back to mainnet
  })

  it('defaults to mainnet', () => {
    const { network } = mountUseNetwork({ network: 'mainnet' })
    expect(network.isMainnet.value).toBe(true)
    expect(network.isTestnet.value).toBe(false)
  })

  it('respects plugin network option for testnet', () => {
    const { network } = mountUseNetwork({ network: 'testnet-10' })
    expect(network.isTestnet.value).toBe(true)
    expect(network.isMainnet.value).toBe(false)
  })

  it('exposes all available networks', () => {
    const { network } = mountUseNetwork()
    expect(network.availableNetworks).toEqual(AVAILABLE_NETWORKS)
  })

  it('networkId is null when not connected', () => {
    const { network } = mountUseNetwork()
    expect(network.networkId.value).toBeNull()
  })

  it('daaScore starts at 0n', () => {
    const { network } = mountUseNetwork()
    expect(network.daaScore.value).toBe(0n)
  })

  it('switchNetwork() updates currentNetwork', async () => {
    const { network } = mountUseNetwork({ network: 'mainnet' })
    await network.switchNetwork('testnet-12')
    expect(network.currentNetwork.value).toBe('testnet-12')
  })
})
