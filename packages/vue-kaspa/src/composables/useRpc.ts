import { computed, inject, onUnmounted, readonly } from 'vue'
import { KaspaRpcError } from '../errors'
import { getRpcManager } from '../internal/rpc-manager'
import { ensureWasmInit } from '../internal/wasm-loader'
import { KASPA_OPTIONS_KEY } from '../symbols'
import type {
  BalanceResult,
  BlockDagInfo,
  BlockInfo,
  ConnectedPeerInfo,
  FeeEstimate,
  GetBlocksOptions,
  MempoolEntry,
  PeerAddress,
  RpcEvent,
  RpcEventType,
  RpcOptions,
  ServerInfo,
  UseRpcReturn,
  UtxoEntry,
  VirtualChainResult,
  VueKaspaOptions,
} from '../types'

export function useRpc(rpcOptions?: RpcOptions): UseRpcReturn {
  const pluginOptions = inject<VueKaspaOptions>(KASPA_OPTIONS_KEY, {})
  const manager = getRpcManager()
  const { state, eventLog, bridge } = manager

  // Track handlers registered by this composable instance for cleanup
  const localHandlers: Array<{ event: RpcEventType; handler: (e: RpcEvent) => void }> = []

  onUnmounted(() => {
    for (const { event, handler } of localHandlers) {
      bridge.off(event, handler)
    }
    localHandlers.length = 0
  })

  function mergeOptions(override?: RpcOptions): RpcOptions {
    const opts: RpcOptions = {}
    const url = override?.url ?? rpcOptions?.url ?? pluginOptions.url
    const resolver = override?.resolver ?? rpcOptions?.resolver ?? pluginOptions.resolver
    const network = override?.network ?? rpcOptions?.network ?? pluginOptions.network
    const encoding = override?.encoding ?? rpcOptions?.encoding ?? pluginOptions.encoding
    if (url !== undefined) opts.url = url
    if (resolver !== undefined) opts.resolver = resolver
    if (network !== undefined) opts.network = network
    if (encoding !== undefined) opts.encoding = encoding
    return opts
  }

  function getClient() {
    const client = manager.getClient()
    if (!client) throw new KaspaRpcError('getClient', 'RPC client not connected')
    return client
  }

  // Helper to build zero-arg subscription wrappers
  function makeSub(method: string) {
    return async (): Promise<void> => {
      try {
        await (getClient() as unknown as Record<string, () => Promise<void>>)[method]()
      } catch (err) {
        throw new KaspaRpcError(method, err)
      }
    }
  }

  return {
    connectionState: readonly(computed(() => state.connectionState)) as UseRpcReturn['connectionState'],
    isConnected: computed(() => state.connectionState === 'connected'),
    url: readonly(computed(() => state.url)) as UseRpcReturn['url'],
    networkId: readonly(computed(() => state.networkId)) as UseRpcReturn['networkId'],
    serverVersion: readonly(computed(() => state.serverVersion)) as UseRpcReturn['serverVersion'],
    isSynced: readonly(computed(() => state.isSynced)) as UseRpcReturn['isSynced'],
    virtualDaaScore: readonly(computed(() => state.virtualDaaScore)) as UseRpcReturn['virtualDaaScore'],
    error: readonly(computed(() => state.error)) as UseRpcReturn['error'],
    eventLog: readonly(eventLog) as UseRpcReturn['eventLog'],

    async connect(options?: RpcOptions): Promise<void> {
      if (state.connectionState === 'connected') return
      state.connectionState = 'connecting'
      state.error = null
      try {
        await ensureWasmInit(pluginOptions)
        await manager.connect(mergeOptions(options))
      } catch (err) {
        throw err
      }
    },

    async disconnect(): Promise<void> {
      await manager.disconnect()
    },

    async reconnect(): Promise<void> {
      await manager.reconnect()
    },

    on<T = unknown>(event: RpcEventType, handler: (event: RpcEvent<T>) => void): void {
      bridge.on(event, handler)
      localHandlers.push({ event, handler: handler as (e: RpcEvent) => void })
    },

    off<T = unknown>(event: RpcEventType, handler: (event: RpcEvent<T>) => void): void {
      bridge.off(event, handler)
      const idx = localHandlers.findIndex((h) => h.event === event && h.handler === handler)
      if (idx !== -1) localHandlers.splice(idx, 1)
    },

    clearEventLog(): void {
      manager.clearEventLog()
    },

    // ─── Query ───────────────────────────────────────────────────────────────

    async getInfo(): Promise<ServerInfo> {
      try {
        const result = await (getClient() as unknown as { getInfo: () => Promise<ServerInfo> }).getInfo()
        return result
      } catch (err) {
        throw new KaspaRpcError('getInfo', err)
      }
    },

    async getBlock(hash: string): Promise<BlockInfo> {
      try {
        const client = getClient() as unknown as { getBlock: (req: unknown) => Promise<{ block: { verboseData: { hash: string; timestamp: string; blueScore: string }; transactions: unknown[] } }> }
        const result = await client.getBlock({ hash, includeTransactions: false })
        const { block } = result
        return {
          hash: block.verboseData.hash,
          timestamp: parseInt(block.verboseData.timestamp),
          blueScore: BigInt(block.verboseData.blueScore),
          transactions: (block.transactions as Array<{ verboseData?: { transactionId: string } }>).map(
            (t) => t.verboseData?.transactionId ?? '',
          ),
        }
      } catch (err) {
        throw new KaspaRpcError('getBlock', err)
      }
    },

    async getBlocks(options?: GetBlocksOptions): Promise<unknown[]> {
      try {
        const client = getClient() as unknown as { getBlocks: (req: unknown) => Promise<{ blockHashes: string[]; blocks?: unknown[] }> }
        const result = await client.getBlocks({
          lowHash: options?.lowHash,
          includeBlocks: options?.includeBlocks ?? true,
          includeTransactions: options?.includeTransactions ?? false,
        })
        return result.blocks ?? result.blockHashes
      } catch (err) {
        throw new KaspaRpcError('getBlocks', err)
      }
    },

    async getBlockCount(): Promise<{ blockCount: bigint; headerCount: bigint }> {
      try {
        return await (getClient() as unknown as { getBlockCount: () => Promise<{ blockCount: bigint; headerCount: bigint }> }).getBlockCount()
      } catch (err) {
        throw new KaspaRpcError('getBlockCount', err)
      }
    },

    async getBlockDagInfo(): Promise<BlockDagInfo> {
      try {
        return await (getClient() as unknown as { getBlockDagInfo: () => Promise<BlockDagInfo> }).getBlockDagInfo()
      } catch (err) {
        throw new KaspaRpcError('getBlockDagInfo', err)
      }
    },

    async getHeaders(startHash: string, limit: number, isAscending: boolean): Promise<unknown[]> {
      try {
        const client = getClient() as unknown as { getHeaders: (req: unknown) => Promise<{ headers: unknown[] }> }
        const result = await client.getHeaders({ startHash, limit, isAscending })
        return result.headers
      } catch (err) {
        throw new KaspaRpcError('getHeaders', err)
      }
    },

    async getSink(): Promise<{ sink: string }> {
      try {
        return await (getClient() as unknown as { getSink: () => Promise<{ sink: string }> }).getSink()
      } catch (err) {
        throw new KaspaRpcError('getSink', err)
      }
    },

    async getSinkBlueScore(): Promise<{ sinkBlueScore: bigint }> {
      try {
        return await (getClient() as unknown as { getSinkBlueScore: () => Promise<{ sinkBlueScore: bigint }> }).getSinkBlueScore()
      } catch (err) {
        throw new KaspaRpcError('getSinkBlueScore', err)
      }
    },

    async getVirtualChainFromBlock(startHash: string, includeAcceptedTxIds: boolean): Promise<VirtualChainResult> {
      try {
        const client = getClient() as unknown as { getVirtualChainFromBlock: (req: unknown) => Promise<VirtualChainResult> }
        return await client.getVirtualChainFromBlock({ startHash, includeAcceptedTransactionIds: includeAcceptedTxIds })
      } catch (err) {
        throw new KaspaRpcError('getVirtualChainFromBlock', err)
      }
    },

    async getBalanceByAddress(address: string): Promise<BalanceResult> {
      try {
        const client = getClient() as unknown as { getBalanceByAddress: (req: unknown) => Promise<{ balance: bigint }> }
        const result = await client.getBalanceByAddress({ address })
        return { address, balance: result.balance }
      } catch (err) {
        throw new KaspaRpcError('getBalanceByAddress', err)
      }
    },

    async getBalancesByAddresses(addresses: string[]): Promise<BalanceResult[]> {
      try {
        const client = getClient() as unknown as { getBalancesByAddresses: (req: unknown) => Promise<{ balances: Array<{ address: string; balance: bigint }> }> }
        const result = await client.getBalancesByAddresses({ addresses })
        return result.balances.map((b) => ({ address: b.address, balance: b.balance }))
      } catch (err) {
        throw new KaspaRpcError('getBalancesByAddresses', err)
      }
    },

    async getUtxosByAddresses(addresses: string[]): Promise<UtxoEntry[]> {
      try {
        const client = getClient() as unknown as { getUtxosByAddresses: (req: unknown) => Promise<{ entries: UtxoEntry[] }> }
        const result = await client.getUtxosByAddresses({ addresses })
        return result.entries
      } catch (err) {
        throw new KaspaRpcError('getUtxosByAddresses', err)
      }
    },

    async getMempoolEntry(transactionId: string): Promise<MempoolEntry> {
      try {
        const client = getClient() as unknown as { getMempoolEntry: (req: unknown) => Promise<{ mempoolEntry: MempoolEntry }> }
        const result = await client.getMempoolEntry({ transactionId, filterTransactionPool: false })
        return result.mempoolEntry
      } catch (err) {
        throw new KaspaRpcError('getMempoolEntry', err)
      }
    },

    async getMempoolEntries(includeOrphanPool = false): Promise<MempoolEntry[]> {
      try {
        const client = getClient() as unknown as { getMempoolEntries: (req: unknown) => Promise<{ mempoolEntries: MempoolEntry[] }> }
        const result = await client.getMempoolEntries({ filterTransactionPool: false, includeOrphanPool })
        return result.mempoolEntries
      } catch (err) {
        throw new KaspaRpcError('getMempoolEntries', err)
      }
    },

    async getMempoolEntriesByAddresses(addresses: string[]): Promise<MempoolEntry[]> {
      try {
        const client = getClient() as unknown as { getMempoolEntriesByAddresses: (req: unknown) => Promise<{ addressEntries: Array<{ sending: MempoolEntry[]; receiving: MempoolEntry[] }> }> }
        const result = await client.getMempoolEntriesByAddresses({ addresses, filterTransactionPool: false, includeOrphanPool: false })
        return result.addressEntries.flatMap((e) => [...e.sending, ...e.receiving])
      } catch (err) {
        throw new KaspaRpcError('getMempoolEntriesByAddresses', err)
      }
    },

    async getFeeEstimate(): Promise<FeeEstimate> {
      try {
        const client = getClient() as unknown as { getFeeEstimate: () => Promise<{ estimate: FeeEstimate }> }
        const result = await client.getFeeEstimate()
        return result.estimate
      } catch (err) {
        throw new KaspaRpcError('getFeeEstimate', err)
      }
    },

    async getCoinSupply(): Promise<{ circulatingCoinSupply: bigint; maxCoinSupply: bigint }> {
      try {
        return await (getClient() as unknown as { getCoinSupply: () => Promise<{ circulatingCoinSupply: bigint; maxCoinSupply: bigint }> }).getCoinSupply()
      } catch (err) {
        throw new KaspaRpcError('getCoinSupply', err)
      }
    },

    async getConnectedPeerInfo(): Promise<ConnectedPeerInfo[]> {
      try {
        const client = getClient() as unknown as { getConnectedPeerInfo: () => Promise<{ peerInfo: ConnectedPeerInfo[] }> }
        const result = await client.getConnectedPeerInfo()
        return result.peerInfo
      } catch (err) {
        throw new KaspaRpcError('getConnectedPeerInfo', err)
      }
    },

    async getPeerAddresses(): Promise<{ banned: PeerAddress[]; known: PeerAddress[] }> {
      try {
        const client = getClient() as unknown as { getPeerAddresses: () => Promise<{ banned: PeerAddress[]; known: PeerAddress[] }> }
        return await client.getPeerAddresses()
      } catch (err) {
        throw new KaspaRpcError('getPeerAddresses', err)
      }
    },

    async getMetrics(): Promise<unknown> {
      try {
        return await (getClient() as unknown as { getMetrics: () => Promise<unknown> }).getMetrics()
      } catch (err) {
        throw new KaspaRpcError('getMetrics', err)
      }
    },

    async getSyncStatus(): Promise<{ isSynced: boolean }> {
      try {
        return await (getClient() as unknown as { getSyncStatus: () => Promise<{ isSynced: boolean }> }).getSyncStatus()
      } catch (err) {
        throw new KaspaRpcError('getSyncStatus', err)
      }
    },

    async getCurrentNetwork(): Promise<string> {
      try {
        const client = getClient() as unknown as { getCurrentNetwork: (req: unknown) => Promise<{ currentNetwork: string }> }
        const result = await client.getCurrentNetwork({})
        return result.currentNetwork
      } catch (err) {
        throw new KaspaRpcError('getCurrentNetwork', err)
      }
    },

    async getSubnetwork(subnetworkId: string): Promise<unknown> {
      try {
        const client = getClient() as unknown as { getSubnetwork: (req: unknown) => Promise<unknown> }
        return await client.getSubnetwork({ subnetworkId })
      } catch (err) {
        throw new KaspaRpcError('getSubnetwork', err)
      }
    },

    async estimateNetworkHashesPerSecond(windowSize: number, tipHash?: string): Promise<{ networkHashesPerSecond: bigint }> {
      try {
        const client = getClient() as unknown as { estimateNetworkHashesPerSecond: (req: unknown) => Promise<{ networkHashesPerSecond: bigint }> }
        return await client.estimateNetworkHashesPerSecond({ windowSize, tipHash })
      } catch (err) {
        throw new KaspaRpcError('estimateNetworkHashesPerSecond', err)
      }
    },

    async getBlockTemplate(payAddress: string, extraData?: string): Promise<unknown> {
      try {
        const client = getClient() as unknown as { getBlockTemplate: (req: unknown) => Promise<unknown> }
        return await client.getBlockTemplate({ payAddress, extraData: extraData ?? '' })
      } catch (err) {
        throw new KaspaRpcError('getBlockTemplate', err)
      }
    },

    // ─── Transactions ────────────────────────────────────────────────────────

    async submitTransaction(tx: unknown): Promise<string> {
      try {
        const client = getClient() as unknown as { submitTransaction: (req: unknown) => Promise<{ transactionId: string }> }
        const result = await client.submitTransaction({ transaction: tx, allowOrphan: false })
        return result.transactionId
      } catch (err) {
        throw new KaspaRpcError('submitTransaction', err)
      }
    },

    // ─── Mining / Admin ──────────────────────────────────────────────────────

    async submitBlock(block: unknown, allowNonDaaBlocks = false): Promise<unknown> {
      try {
        const client = getClient() as unknown as { submitBlock: (req: unknown) => Promise<unknown> }
        return await client.submitBlock({ block, allowNonDaaBlocks })
      } catch (err) {
        throw new KaspaRpcError('submitBlock', err)
      }
    },

    async addPeer(peerAddress: string, isTrustPeer = false): Promise<void> {
      try {
        const client = getClient() as unknown as { addPeer: (req: unknown) => Promise<void> }
        await client.addPeer({ peerAddress, isTrustPeer })
      } catch (err) {
        throw new KaspaRpcError('addPeer', err)
      }
    },

    async ban(ip: string): Promise<void> {
      try {
        const client = getClient() as unknown as { ban: (req: unknown) => Promise<void> }
        await client.ban({ ip })
      } catch (err) {
        throw new KaspaRpcError('ban', err)
      }
    },

    async unban(ip: string): Promise<void> {
      try {
        const client = getClient() as unknown as { unban: (req: unknown) => Promise<void> }
        await client.unban({ ip })
      } catch (err) {
        throw new KaspaRpcError('unban', err)
      }
    },

    async resolveFinalityConflict(finalityBlockHash: string): Promise<void> {
      try {
        const client = getClient() as unknown as { resolveFinalityConflict: (req: unknown) => Promise<void> }
        await client.resolveFinalityConflict({ finalityBlockHash })
      } catch (err) {
        throw new KaspaRpcError('resolveFinalityConflict', err)
      }
    },

    async shutdown(): Promise<void> {
      try {
        await (getClient() as unknown as { shutdown: () => Promise<void> }).shutdown()
      } catch (err) {
        throw new KaspaRpcError('shutdown', err)
      }
    },

    // ─── Subscriptions ───────────────────────────────────────────────────────

    async ping(): Promise<void> {
      try {
        await (getClient() as unknown as { ping: () => Promise<void> }).ping()
      } catch (err) {
        throw new KaspaRpcError('ping', err)
      }
    },

    subscribeDaaScore: makeSub('subscribeVirtualDaaScoreChanged'),
    unsubscribeDaaScore: makeSub('unsubscribeVirtualDaaScoreChanged'),

    async subscribeUtxosChanged(addresses: string[]): Promise<void> {
      try {
        await (getClient() as unknown as { subscribeUtxosChanged: (a: string[]) => Promise<void> }).subscribeUtxosChanged(addresses)
      } catch (err) {
        throw new KaspaRpcError('subscribeUtxosChanged', err)
      }
    },

    async unsubscribeUtxosChanged(addresses: string[]): Promise<void> {
      try {
        await (getClient() as unknown as { unsubscribeUtxosChanged: (a: string[]) => Promise<void> }).unsubscribeUtxosChanged(addresses)
      } catch (err) {
        throw new KaspaRpcError('unsubscribeUtxosChanged', err)
      }
    },

    async subscribeVirtualChainChanged(includeAcceptedTxIds: boolean): Promise<void> {
      try {
        await (getClient() as unknown as { subscribeVirtualChainChanged: (v: boolean) => Promise<void> }).subscribeVirtualChainChanged(includeAcceptedTxIds)
      } catch (err) {
        throw new KaspaRpcError('subscribeVirtualChainChanged', err)
      }
    },

    async unsubscribeVirtualChainChanged(includeAcceptedTxIds: boolean): Promise<void> {
      try {
        await (getClient() as unknown as { unsubscribeVirtualChainChanged: (v: boolean) => Promise<void> }).unsubscribeVirtualChainChanged(includeAcceptedTxIds)
      } catch (err) {
        throw new KaspaRpcError('unsubscribeVirtualChainChanged', err)
      }
    },

    subscribeBlockAdded: makeSub('subscribeBlockAdded'),
    unsubscribeBlockAdded: makeSub('unsubscribeBlockAdded'),
    subscribeFinalityConflict: makeSub('subscribeFinalityConflict'),
    unsubscribeFinalityConflict: makeSub('unsubscribeFinalityConflict'),
    subscribeFinalityConflictResolved: makeSub('subscribeFinalityConflictResolved'),
    unsubscribeFinalityConflictResolved: makeSub('unsubscribeFinalityConflictResolved'),
    subscribeSinkBlueScoreChanged: makeSub('subscribeSinkBlueScoreChanged'),
    unsubscribeSinkBlueScoreChanged: makeSub('unsubscribeSinkBlueScoreChanged'),
    subscribeVirtualDaaScoreChanged: makeSub('subscribeVirtualDaaScoreChanged'),
    unsubscribeVirtualDaaScoreChanged: makeSub('unsubscribeVirtualDaaScoreChanged'),
    subscribePruningPointUtxoSetOverride: makeSub('subscribePruningPointUtxoSetOverride'),
    unsubscribePruningPointUtxoSetOverride: makeSub('unsubscribePruningPointUtxoSetOverride'),
    subscribeNewBlockTemplate: makeSub('subscribeNewBlockTemplate'),
    unsubscribeNewBlockTemplate: makeSub('unsubscribeNewBlockTemplate'),
  }
}
