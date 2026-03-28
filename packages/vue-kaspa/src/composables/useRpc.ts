import { computed, readonly, onUnmounted } from 'vue'
import { inject } from 'vue'
import { getRpcManager } from '../internal/rpc-manager'
import { ensureWasmInit } from '../internal/wasm-loader'
import { KASPA_OPTIONS_KEY } from '../symbols'
import { KaspaRpcError } from '../errors'
import type {
  KaspaPluginOptions,
  RpcOptions,
  RpcEvent,
  RpcEventType,
  UseRpcReturn,
  ServerInfo,
  BlockInfo,
  BalanceResult,
  UtxoEntry,
  MempoolEntry,
  FeeEstimate,
} from '../types'

export function useRpc(rpcOptions?: RpcOptions): UseRpcReturn {
  const pluginOptions = inject<KaspaPluginOptions>(KASPA_OPTIONS_KEY, {})
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

    async getBlockCount(): Promise<{ blockCount: bigint; headerCount: bigint }> {
      try {
        return await (getClient() as unknown as { getBlockCount: () => Promise<{ blockCount: bigint; headerCount: bigint }> }).getBlockCount()
      } catch (err) {
        throw new KaspaRpcError('getBlockCount', err)
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

    async submitTransaction(tx: unknown): Promise<string> {
      try {
        const client = getClient() as unknown as { submitTransaction: (req: unknown) => Promise<{ transactionId: string }> }
        const result = await client.submitTransaction({ transaction: tx, allowOrphan: false })
        return result.transactionId
      } catch (err) {
        throw new KaspaRpcError('submitTransaction', err)
      }
    },

    async getCoinSupply(): Promise<{ circulatingCoinSupply: bigint; maxCoinSupply: bigint }> {
      try {
        return await (getClient() as unknown as { getCoinSupply: () => Promise<{ circulatingCoinSupply: bigint; maxCoinSupply: bigint }> }).getCoinSupply()
      } catch (err) {
        throw new KaspaRpcError('getCoinSupply', err)
      }
    },

    async ping(): Promise<void> {
      try {
        await (getClient() as unknown as { ping: () => Promise<void> }).ping()
      } catch (err) {
        throw new KaspaRpcError('ping', err)
      }
    },

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
  }
}
