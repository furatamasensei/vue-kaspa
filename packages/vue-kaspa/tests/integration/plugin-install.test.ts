import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, inject } from 'vue'
import {
  VueKaspa, useKaspa, useRpc, useUtxo, useTransaction, useCrypto, useNetwork,
  KaspaError, KaspaNotReadyError, KaspaRpcError, KaspaWalletError, AVAILABLE_NETWORKS,
} from '../../src/index'
import { KASPA_OPTIONS_KEY } from '../../src/symbols'
import { resetRpcManager } from '../../src/internal/rpc-manager'
import { resetWasm } from '../../src/internal/wasm-loader'

describe('Plugin install integration', () => {
  beforeEach(() => {
    resetRpcManager()
    resetWasm()
  })

  it('all composables are accessible after plugin install', () => {
    const results: Record<string, unknown> = {}
    const TestComponent = defineComponent({
      setup() {
        results.kaspa = useKaspa()
        results.rpc = useRpc()
        results.utxo = useUtxo()
        results.transaction = useTransaction()
        results.crypto = useCrypto()
        results.network = useNetwork()
        return () => null
      },
    })
    mount(TestComponent, {
      global: { plugins: [[VueKaspa, { autoConnect: false }]] },
    })
    expect(results.kaspa).toBeDefined()
    expect(results.rpc).toBeDefined()
    expect(results.utxo).toBeDefined()
    expect(results.transaction).toBeDefined()
    expect(results.crypto).toBeDefined()
    expect(results.network).toBeDefined()
  })

  it('plugin options are provided to all composables via inject', () => {
    let injectedOptions: unknown
    const TestComponent = defineComponent({
      setup() {
        injectedOptions = inject(KASPA_OPTIONS_KEY)
        return () => null
      },
    })
    mount(TestComponent, {
      global: {
        plugins: [[VueKaspa, { network: 'testnet-12', url: 'ws://test:17110', autoConnect: false }]],
      },
    })
    expect((injectedOptions as Record<string, unknown>).network).toBe('testnet-12')
    expect((injectedOptions as Record<string, unknown>).url).toBe('ws://test:17110')
  })

  it('useKaspa and useRpc share the same reactive WASM state across components', async () => {
    const kaspaStates: Array<ReturnType<typeof useKaspa>> = []
    const rpcStates: Array<ReturnType<typeof useRpc>> = []

    const ComponentA = defineComponent({
      setup() { kaspaStates.push(useKaspa()); return () => null },
    })
    const ComponentB = defineComponent({
      setup() { kaspaStates.push(useKaspa()); return () => null },
    })
    const ComponentC = defineComponent({
      setup() { rpcStates.push(useRpc()); return () => null },
    })

    mount({
      components: { ComponentA, ComponentB, ComponentC },
      template: '<ComponentA /><ComponentB /><ComponentC />',
    }, {
      global: { plugins: [[VueKaspa, { autoConnect: false }]] },
    })

    // Both kaspa instances reference the same computed
    expect(kaspaStates[0].wasmStatus.value).toBe(kaspaStates[1].wasmStatus.value)

    // Init from first instance reflects in second
    await kaspaStates[0].init()
    expect(kaspaStates[1].isReady.value).toBe(true)
  })

  it('useRpc and useNetwork share the same connection state', async () => {
    let rpcResult: ReturnType<typeof useRpc>
    let networkResult: ReturnType<typeof useNetwork>

    const TestComponent = defineComponent({
      setup() {
        rpcResult = useRpc()
        networkResult = useNetwork()
        return () => null
      },
    })
    mount(TestComponent, {
      global: { plugins: [[VueKaspa, { autoConnect: false }]] },
    })

    await rpcResult!.connect()

    // networkId via useNetwork reads from the same RpcManager state
    expect(networkResult!.networkId.value).toBe('kaspa-mainnet')
    expect(networkResult!.daaScore.value).toBe(0n)
  })

  it('exports all public API surface', () => {
    expect(typeof VueKaspa.install).toBe('function')
    expect(typeof useKaspa).toBe('function')
    expect(typeof useRpc).toBe('function')
    expect(typeof useUtxo).toBe('function')
    expect(typeof useTransaction).toBe('function')
    expect(typeof useCrypto).toBe('function')
    expect(typeof useNetwork).toBe('function')
    expect(typeof KaspaError).toBe('function')
    expect(typeof KaspaNotReadyError).toBe('function')
    expect(typeof KaspaRpcError).toBe('function')
    expect(typeof KaspaWalletError).toBe('function')
    expect(AVAILABLE_NETWORKS).toEqual(['mainnet', 'testnet-10', 'testnet-12', 'simnet', 'devnet'])
  })
})
