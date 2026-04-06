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

  // ─── New query methods ───────────────────────────────────────────────────

  it('getBlockDagInfo() returns dag info', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const info = await rpc.getBlockDagInfo()
    expect(info.networkName).toBe('kaspa-mainnet')
    expect(info.blockCount).toBe(1000n)
    expect(info.tipHashes).toBeInstanceOf(Array)
  })

  it('getSink() returns sink hash', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const result = await rpc.getSink()
    expect(result.sink).toBe('mock-sink-hash')
  })

  it('getSinkBlueScore() returns blue score', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const result = await rpc.getSinkBlueScore()
    expect(result.sinkBlueScore).toBe(100n)
  })

  it('getConnectedPeerInfo() returns peer list', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const peers = await rpc.getConnectedPeerInfo()
    expect(peers).toBeInstanceOf(Array)
  })

  it('getPeerAddresses() returns banned and known lists', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const result = await rpc.getPeerAddresses()
    expect(result.banned).toBeInstanceOf(Array)
    expect(result.known).toBeInstanceOf(Array)
  })

  it('getSyncStatus() returns sync state', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const status = await rpc.getSyncStatus()
    expect(status.isSynced).toBe(true)
  })

  it('getMetrics() returns metrics object', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const metrics = await rpc.getMetrics()
    expect(metrics).toBeDefined()
  })

  it('getMempoolEntry() returns a single entry', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const entry = await rpc.getMempoolEntry('mock-txid')
    expect(entry.fee).toBe(1000n)
    expect(entry.transaction.id).toBe('mock-txid')
  })

  it('getVirtualChainFromBlock() returns chain result', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const result = await rpc.getVirtualChainFromBlock('mock-hash', false)
    expect(result.addedChainBlockHashes).toBeInstanceOf(Array)
    expect(result.removedChainBlockHashes).toBeInstanceOf(Array)
  })

  it('estimateNetworkHashesPerSecond() returns hash rate', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const result = await rpc.estimateNetworkHashesPerSecond(1000)
    expect(result.networkHashesPerSecond).toBe(1_000_000n)
  })

  it('getBlocks() passes options to client', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const blocks = await rpc.getBlocks({ includeBlocks: true })
    expect(blocks).toBeInstanceOf(Array)
    const manager = getRpcManager()
    const client = manager.getClient() as unknown as { getBlocks: ReturnType<typeof vi.fn> }
    expect(client.getBlocks).toHaveBeenCalledWith(expect.objectContaining({ includeBlocks: true }))
  })

  it('getCurrentNetwork() returns network string', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const network = await rpc.getCurrentNetwork()
    expect(network).toBe('mainnet')
  })

  it('getHeaders() returns array', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const headers = await rpc.getHeaders('mock-hash', 10, true)
    expect(headers).toBeInstanceOf(Array)
  })

  // ─── Admin / Mining ──────────────────────────────────────────────────────

  it('submitBlock() calls client submitBlock', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const result = await rpc.submitBlock({}, false)
    expect(result).toBeDefined()
  })

  it('addPeer() resolves without error', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await expect(rpc.addPeer('127.0.0.1:16110')).resolves.toBeUndefined()
  })

  it('ban() resolves without error', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await expect(rpc.ban('127.0.0.1')).resolves.toBeUndefined()
  })

  it('unban() resolves without error', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await expect(rpc.unban('127.0.0.1')).resolves.toBeUndefined()
  })

  it('resolveFinalityConflict() resolves without error', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await expect(rpc.resolveFinalityConflict('mock-hash')).resolves.toBeUndefined()
  })

  it('shutdown() resolves without error', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await expect(rpc.shutdown()).resolves.toBeUndefined()
  })

  // ─── New subscriptions ───────────────────────────────────────────────────

  it('subscribeDaaScore() / unsubscribeDaaScore() resolve', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await expect(rpc.subscribeDaaScore()).resolves.toBeUndefined()
    await expect(rpc.unsubscribeDaaScore()).resolves.toBeUndefined()
  })

  it('subscribeBlockAdded() / unsubscribeBlockAdded() resolve', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await expect(rpc.subscribeBlockAdded()).resolves.toBeUndefined()
    await expect(rpc.unsubscribeBlockAdded()).resolves.toBeUndefined()
  })

  it('subscribeVirtualChainChanged() / unsubscribeVirtualChainChanged() resolve', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await expect(rpc.subscribeVirtualChainChanged(true)).resolves.toBeUndefined()
    await expect(rpc.unsubscribeVirtualChainChanged(true)).resolves.toBeUndefined()
  })

  it('subscribeSinkBlueScoreChanged() / unsubscribeSinkBlueScoreChanged() resolve', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await expect(rpc.subscribeSinkBlueScoreChanged()).resolves.toBeUndefined()
    await expect(rpc.unsubscribeSinkBlueScoreChanged()).resolves.toBeUndefined()
  })

  it('subscribeVirtualDaaScoreChanged() / unsubscribeVirtualDaaScoreChanged() resolve', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await expect(rpc.subscribeVirtualDaaScoreChanged()).resolves.toBeUndefined()
    await expect(rpc.unsubscribeVirtualDaaScoreChanged()).resolves.toBeUndefined()
  })

  it('subscribeNewBlockTemplate() / unsubscribeNewBlockTemplate() resolve', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await expect(rpc.subscribeNewBlockTemplate()).resolves.toBeUndefined()
    await expect(rpc.unsubscribeNewBlockTemplate()).resolves.toBeUndefined()
  })

  it('subscribeFinalityConflict() / unsubscribeFinalityConflict() resolve', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await expect(rpc.subscribeFinalityConflict()).resolves.toBeUndefined()
    await expect(rpc.unsubscribeFinalityConflict()).resolves.toBeUndefined()
  })

  it('subscribeFinalityConflictResolved() / unsubscribeFinalityConflictResolved() resolve', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await expect(rpc.subscribeFinalityConflictResolved()).resolves.toBeUndefined()
    await expect(rpc.unsubscribeFinalityConflictResolved()).resolves.toBeUndefined()
  })

  it('subscribePruningPointUtxoSetOverride() / unsubscribePruningPointUtxoSetOverride() resolve', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    await expect(rpc.subscribePruningPointUtxoSetOverride()).resolves.toBeUndefined()
    await expect(rpc.unsubscribePruningPointUtxoSetOverride()).resolves.toBeUndefined()
  })

  // ─── Error propagation ───────────────────────────────────────────────────

  it('getBlockDagInfo() throws KaspaRpcError on failure', async () => {
    const { rpc } = mountUseRpc()
    await rpc.connect()
    const manager = getRpcManager()
    const client = manager.getClient() as unknown as { getBlockDagInfo: ReturnType<typeof vi.fn> }
    client.getBlockDagInfo.mockRejectedValueOnce(new Error('dag error'))
    await expect(rpc.getBlockDagInfo()).rejects.toThrow('getBlockDagInfo')
  })

  it('throws when calling any method without connection', async () => {
    const { rpc } = mountUseRpc()
    await expect(rpc.getBlockDagInfo()).rejects.toThrow()
    await expect(rpc.getSink()).rejects.toThrow()
    await expect(rpc.getConnectedPeerInfo()).rejects.toThrow()
  })
})
