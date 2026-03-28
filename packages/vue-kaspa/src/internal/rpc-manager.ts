import { shallowReactive, ref } from 'vue'
import type { RpcConnectionState, RpcOptions, RpcEvent, RpcEventType } from '../types'
import { KaspaRpcError } from '../errors'
import { EventBridge } from './event-bridge'
import { getKaspa } from './kaspa'

const BASE_RECONNECT_DELAY_MS = 1_000
const MAX_RECONNECT_DELAY_MS = 30_000

type AnyRpcClient = {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  url: string
  addEventListener: (event: string, cb: (event: unknown) => void) => void
  removeEventListener: (event: string, cb?: (event: unknown) => void) => void
  subscribeVirtualDaaScoreChanged: () => Promise<void>
  getServerInfo: () => Promise<{
    isSynced: boolean
    serverVersion: string
    networkId: string
    isUtxoIndexEnabled: boolean
    hasNotifyCommand: boolean
    hasMessageId: boolean
  }>
  [key: string]: unknown
}

export interface RpcManagerState {
  connectionState: RpcConnectionState
  url: string | null
  networkId: string | null
  serverVersion: string | null
  isSynced: boolean
  virtualDaaScore: bigint
  error: Error | null
}

export class RpcManager {
  readonly state = shallowReactive<RpcManagerState>({
    connectionState: 'disconnected',
    url: null,
    networkId: null,
    serverVersion: null,
    isSynced: false,
    virtualDaaScore: 0n,
    error: null,
  })

  readonly eventLog = ref<RpcEvent[]>([])
  readonly bridge = new EventBridge()

  private client: AnyRpcClient | null = null
  private currentOptions: RpcOptions = {}
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  getClient(): AnyRpcClient | null {
    return this.client
  }

  async connect(options: RpcOptions): Promise<void> {
    if (this.state.connectionState === 'connected') return

    this.currentOptions = options
    // Only set 'connecting' if not already set (useRpc sets it before calling)
    if (this.state.connectionState !== 'connecting') {
      this.state.connectionState = 'connecting'
    }
    this.state.error = null

    try {
      const { RpcClient, Resolver, Encoding } = getKaspa()

      const config: Record<string, unknown> = {
        networkId: options.network ?? 'mainnet',
      }

      if (options.url) {
        config.url = options.url
      } else {
        config.resolver = new Resolver()
      }

      if (options.encoding === 'SerdeJson') {
        config.encoding = Encoding.SerdeJson
      }

      this.client = new RpcClient(config) as unknown as AnyRpcClient

      // DAA score updates
      this.bridge.on('virtual-daa-score-changed', (event) => {
        const data = event.data as { virtualDaaScore?: bigint } | null
        if (data?.virtualDaaScore !== undefined) {
          this.state.virtualDaaScore = data.virtualDaaScore
        }
      })

      // Auto-reconnect on disconnect
      this.bridge.on('disconnect', () => {
        this.state.connectionState = 'reconnecting'
        this.scheduleReconnect()
      })

      this.bridge.attach(this.client)
      await this.client.connect()

      // Subscribe to live DAA score updates from the server
      await this.client.subscribeVirtualDaaScoreChanged()

      // Fetch server info
      const info = await this.client.getServerInfo()
      this.state.serverVersion = info.serverVersion
      this.state.networkId = info.networkId
      this.state.isSynced = info.isSynced
      this.state.url = this.client.url

      this.state.connectionState = 'connected'
      this.reconnectAttempts = 0

      // Pipe events to the log
      const logEvents: RpcEventType[] = [
        'block-added',
        'virtual-chain-changed',
        'utxos-changed',
        'finality-conflict',
        'sink-blue-score-changed',
        'virtual-daa-score-changed',
        'new-block-template',
        'connect',
        'disconnect',
      ]
      for (const evType of logEvents) {
        this.bridge.on(evType, (e) => this.pushEventLog(e))
      }
    } catch (err: unknown) {
      this.state.connectionState = 'error'
      this.state.error = err instanceof Error ? err : new Error(String(err))
      this.client = null
      throw new KaspaRpcError('connect', err)
    }
  }

  async disconnect(): Promise<void> {
    this.cancelReconnect()

    if (this.client) {
      this.bridge.detach(this.client)
      try {
        await this.client.disconnect()
      } catch {
        // Ignore disconnect errors
      }
      this.client = null
    }

    this.bridge.clear()
    this.state.connectionState = 'disconnected'
    this.state.url = null
    this.state.networkId = null
    this.state.serverVersion = null
    this.state.isSynced = false
  }

  async reconnect(): Promise<void> {
    await this.disconnect()
    await this.connect(this.currentOptions)
  }

  clearEventLog(): void {
    this.eventLog.value = []
  }

  private pushEventLog(event: RpcEvent): void {
    this.eventLog.value = [...this.eventLog.value.slice(-199), event]
  }

  private scheduleReconnect(): void {
    this.cancelReconnect()
    const delay = Math.min(
      BASE_RECONNECT_DELAY_MS * Math.pow(2, this.reconnectAttempts),
      MAX_RECONNECT_DELAY_MS,
    )
    this.reconnectAttempts++
    this.reconnectTimer = setTimeout(() => {
      this.reconnect().catch(() => {
        // Will retry via disconnect event
      })
    }, delay)
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

// Module-level singleton shared across all composable instances
let managerInstance: RpcManager | null = null

export function getRpcManager(): RpcManager {
  if (!managerInstance) {
    managerInstance = new RpcManager()
  }
  return managerInstance
}

export function resetRpcManager(): void {
  managerInstance = null
}
