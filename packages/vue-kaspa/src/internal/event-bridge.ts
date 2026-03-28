import type { RpcEventType, RpcEvent } from '../types'

export type EventHandler<T = unknown> = (event: RpcEvent<T>) => void

type AnyRpcClient = {
  addEventListener: (event: string, cb: (event: unknown) => void) => void
  removeEventListener: (event: string, cb?: (event: unknown) => void) => void
}

// Matches the RpcEventType union — all event names the SDK emits
const ALL_RPC_EVENTS: RpcEventType[] = [
  'connect',
  'disconnect',
  'block-added',
  'virtual-chain-changed',
  'utxos-changed',
  'finality-conflict',
  'finality-conflict-resolved',
  'sink-blue-score-changed',
  'virtual-daa-score-changed',
  'new-block-template',
  'pruning-point-utxo-set-override',
]

export class EventBridge {
  private readonly handlers = new Map<RpcEventType, Set<EventHandler>>()
  private readonly sdkListeners = new Map<RpcEventType, (raw: unknown) => void>()
  private client: AnyRpcClient | null = null

  on<T = unknown>(event: RpcEventType, handler: EventHandler<T>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler as EventHandler)
  }

  off<T = unknown>(event: RpcEventType, handler: EventHandler<T>): void {
    this.handlers.get(event)?.delete(handler as EventHandler)
  }

  attach(client: AnyRpcClient): void {
    this.client = client
    for (const eventType of ALL_RPC_EVENTS) {
      const listener = (raw: unknown) => {
        // SDK v1.1.0 wraps events as { event: string, data: T }
        // Unwrap so handlers receive just the payload in event.data
        const sdkEvent = raw as { event?: string; data?: unknown } | null
        const event: RpcEvent = {
          type: eventType,
          data: sdkEvent?.data ?? null,
          timestamp: Date.now(),
        }
        this.emit(event)
      }
      this.sdkListeners.set(eventType, listener)
      client.addEventListener(eventType, listener)
    }
  }

  detach(client: AnyRpcClient): void {
    for (const [eventType, listener] of this.sdkListeners) {
      client.removeEventListener(eventType, listener)
    }
    this.sdkListeners.clear()
    if (this.client === client) {
      this.client = null
    }
  }

  emit(event: RpcEvent): void {
    const handlers = this.handlers.get(event.type)
    if (handlers) {
      for (const handler of handlers) {
        handler(event)
      }
    }
  }

  clear(): void {
    this.handlers.clear()
  }
}
