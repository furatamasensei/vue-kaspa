import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { VueKaspa } from '../../src/plugin'
import { useRpc } from '../../src/composables/useRpc'
import { useTransactionListener } from '../../src/composables/useTransactionListener'
import { getRpcManager, resetRpcManager } from '../../src/internal/rpc-manager'
import { resetWasm } from '../../src/internal/wasm-loader'

function mountUseTransactionListener(listenerOptions = {}) {
  let rpcResult: ReturnType<typeof useRpc>
  let listenerResult: ReturnType<typeof useTransactionListener>

  const TestComponent = defineComponent({
    setup() {
      rpcResult = useRpc()
      listenerResult = useTransactionListener(listenerOptions)
      return () => null
    },
  })

  const wrapper = mount(TestComponent, {
    global: { plugins: [[VueKaspa, { autoConnect: false }]] },
    attachTo: document.body,
  })

  return {
    wrapper,
    get rpc() {
      return rpcResult
    },
    get listener() {
      return listenerResult
    },
  }
}

describe('useTransactionListener', () => {
  beforeEach(() => {
    resetRpcManager()
    resetWasm()
  })

  it('collects sender addresses for accepted transactions when enabled', async () => {
    const { rpc, listener } = mountUseTransactionListener({ autoSubscribe: false, includeSenderAddresses: true })
    await rpc.connect()
    await listener.subscribe()

    const manager = getRpcManager()
    manager.bridge['emit']({
      type: 'virtual-chain-changed',
      data: {
        removedChainBlockHashes: [],
        addedChainBlockHashes: ['mock-block'],
        acceptedTransactionIds: [
          {
            acceptingBlockHash: 'mock-block',
            acceptedTransactionIds: ['mock-txid'],
          },
        ],
      },
      timestamp: Date.now(),
    })

    await flushPromises()

    expect(listener.transactions.value).toEqual(['mock-txid'])
    expect(listener.acceptedTransactions.value).toEqual([
      {
        transactionId: 'mock-txid',
        acceptingBlockHash: 'mock-block',
        senderAddresses: ['kaspa:qrmocksender'],
      },
    ])
  })

  it('can resolve sender addresses on demand', async () => {
    const { rpc, listener } = mountUseTransactionListener({ autoSubscribe: false })
    await rpc.connect()
    await listener.subscribe()

    const manager = getRpcManager()
    manager.bridge['emit']({
      type: 'virtual-chain-changed',
      data: {
        removedChainBlockHashes: [],
        addedChainBlockHashes: ['mock-block'],
        acceptedTransactionIds: [
          {
            acceptingBlockHash: 'mock-block',
            acceptedTransactionIds: ['mock-txid'],
          },
        ],
      },
      timestamp: Date.now(),
    })

    await flushPromises()

    expect(listener.acceptedTransactions.value[0].senderAddresses).toEqual([])

    const senderAddresses = await listener.resolveSenderAddresses('mock-txid')
    expect(senderAddresses).toEqual(['kaspa:qrmocksender'])
    expect(listener.acceptedTransactions.value[0].senderAddresses).toEqual(['kaspa:qrmocksender'])
  })
})
