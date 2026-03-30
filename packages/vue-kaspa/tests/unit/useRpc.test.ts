import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { RpcClient, createRpcClientMock } from '../mocks/kaspa-wasm'
import { VueKaspa } from '../../src/plugin'
import { useRpc } from '../../src/composables/useRpc'
import { resetRpcManager, getRpcManager } from '../../src/internal/rpc-manager'
import { resetWasm } from '../../src/internal/wasm-loader'

function mountUseRpc(pluginOptions = {}, rpcOptions = {}) {
  let result: ReturnType<typeof useRpc>
  const TestComponent = defineComponent({
    setup() {
      result = useRpc(rpcOptions)
      return () => null
    },
  })
  const wrapper = mount(TestComponent, {
    global: { plugins: [[VueKaspa, { autoConnect: false, ...pluginOptions }]] },
    attachTo: document.body,
  })
  return { wrapper, get rpc() { return result } }
}

describe('useRpc', () => {
  beforeEach(() => {
    resetRpcManager()
    resetWasm()
  })

  it('starts in disconnected state', () => {
    const { rpc } = mountUseRpc()
    expect(rpc.connectionState.value).toBe('disconnected')
    expect(rpc.isConnected.value).toBe(false)
    expect(rpc.url.value).toBeNull()
    expect(rpc.error.value).toBeNull()
  })

  it('transitions to connecting then connected on connect()', async () => {
    const { rpc } = mountUseRpc()
    const promise = rpc.connect()
    expect(rpc.connectionState.value).toBe('connecting')
    await promise
    expect(rpc.connectionState.value).toBe('connected')
    expect(rpc.isConnected.value).toBe(true)
  })

  it('populates url, networkId, serverVersion after connect', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    expect(rpc.url.value).toBe('ws://mock-node:17110')
    expect(rpc.networkId.value).toBe('kaspa-mainnet')
    expect(rpc.serverVersion.value).toBe('1.1.0')
    expect(rpc.isSynced.value).toBe(true)
  })

  it('transitions to disconnected on disconnect()', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await rpc.disconnect()
    expect(rpc.connectionState.value).toBe('disconnected')
    expect(rpc.isConnected.value).toBe(false)
    expect(rpc.url.value).toBeNull()
  })

  it('sets error state when connect fails', async () => {
    RpcClient.mockImplementationOnce(function() {
      return {
        ...createRpcClientMock(),
        connect: vi.fn().mockRejectedValueOnce(new Error('refused')),
      }
    })
    const { rpc } = mountUseRpc()
    await expect(rpc.connect()).rejects.toThrow()
    expect(rpc.connectionState.value).toBe('error')
    expect(rpc.error.value).toBeInstanceOf(Error)
  })

  it('getBalanceByAddress() returns balance result', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const result = await rpc.getBalanceByAddress('kaspa:qr...')
    expect(result.balance).toBe(1_000_000_000n)
  })

  it('getInfo() returns server info', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const info = await rpc.getInfo()
    expect(info.serverVersion).toBe('1.1.0')
    expect(info.isSynced).toBe(true)
  })

  it('getFeeEstimate() returns fee buckets', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const fees = await rpc.getFeeEstimate()
    expect(fees.priorityBucket).toBeDefined()
    expect(fees.normalBuckets).toBeInstanceOf(Array)
  })

  it('on() registers handler called on events', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const handler = vi.fn()
    rpc.on('block-added', handler)
    // Emit via the bridge directly
    const manager = getRpcManager()
    manager.bridge['emit']({ type: 'block-added', data: { hash: 'abc' }, timestamp: Date.now() })
    expect(handler).toHaveBeenCalledOnce()
    expect(handler.mock.calls[0][0].type).toBe('block-added')
  })

  it('off() removes the handler', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const handler = vi.fn()
    rpc.on('block-added', handler)
    rpc.off('block-added', handler)
    const manager = getRpcManager()
    manager.bridge['emit']({ type: 'block-added', data: {}, timestamp: Date.now() })
    expect(handler).not.toHaveBeenCalled()
  })

  it('clearEventLog() empties the event log', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    rpc.clearEventLog()
    expect(rpc.eventLog.value).toHaveLength(0)
  })

  it('connect() is a no-op when already connected', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await rpc.connect()
    expect(RpcClient).toHaveBeenCalledTimes(1)
  })
})
