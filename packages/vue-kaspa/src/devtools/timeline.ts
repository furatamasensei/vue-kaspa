import type { RpcEvent } from '../types'

export const TIMELINE_RPC_LAYER = 'kaspa-events'
export const TIMELINE_LIFECYCLE_LAYER = 'kaspa-lifecycle'
export const TIMELINE_WALLET_LAYER = 'kaspa-wallet'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DevtoolsApi = any

// ─── Layer setup ───────────────────────────────────────────────────────────

export function setupTimeline(api: DevtoolsApi): void {
  api.addTimelineLayer({
    id: TIMELINE_RPC_LAYER,
    label: 'Kaspa RPC Events',
    color: 0x49c5a3,
  })
  api.addTimelineLayer({
    id: TIMELINE_LIFECYCLE_LAYER,
    label: 'Kaspa Lifecycle',
    color: 0x2196f3,
  })
  api.addTimelineLayer({
    id: TIMELINE_WALLET_LAYER,
    label: 'Kaspa Wallet',
    color: 0x9c27b0,
  })
}

// ─── RPC events ────────────────────────────────────────────────────────────

export function postRpcEvent(api: DevtoolsApi, event: RpcEvent): void {
  const logType =
    event.type === 'finality-conflict' ? 'warning'
    : event.type === 'disconnect' ? 'error'
    : 'default'

  api.addTimelineEvent({
    layerId: TIMELINE_RPC_LAYER,
    event: {
      time: api.now(),
      title: event.type,
      subtitle: summarizeRpcEvent(event),
      data: enrichRpcEventData(event),
      groupId: event.type,
      logType,
    },
  })
}

// ─── Lifecycle events ──────────────────────────────────────────────────────

export function postLifecycleEvent(
  api: DevtoolsApi,
  title: string,
  data: Record<string, unknown>,
  logType: 'default' | 'warning' | 'error' = 'default',
): void {
  api.addTimelineEvent({
    layerId: TIMELINE_LIFECYCLE_LAYER,
    event: { time: api.now(), title, data, logType },
  })
}

// ─── Wallet events ─────────────────────────────────────────────────────────

export function postWalletEvent(
  api: DevtoolsApi,
  title: string,
  data: Record<string, unknown>,
): void {
  api.addTimelineEvent({
    layerId: TIMELINE_WALLET_LAYER,
    event: { time: api.now(), title, data },
  })
}

// ─── RPC event helpers ─────────────────────────────────────────────────────

function summarizeRpcEvent(event: RpcEvent): string {
  const data = event.data as Record<string, unknown> | null
  if (!data) return ''

  if (event.type === 'block-added') {
    const block = data.block as {
      verboseData?: { hash?: string; blueScore?: string }
      transactions?: unknown[]
    } | undefined
    const parts: string[] = []
    const hash = block?.verboseData?.hash
    if (hash) parts.push(`#${hash.slice(0, 10)}…`)
    const txCount = block?.transactions?.length
    if (txCount !== undefined) parts.push(`${txCount} tx`)
    const blueScore = block?.verboseData?.blueScore
    if (blueScore) parts.push(`blue: ${blueScore}`)
    return parts.join(' · ')
  }

  if (event.type === 'utxos-changed') {
    const added = (data.added as unknown[] | undefined)?.length ?? 0
    const removed = (data.removed as unknown[] | undefined)?.length ?? 0
    const parts: string[] = []
    if (added) parts.push(`+${added} added`)
    if (removed) parts.push(`−${removed} removed`)
    return parts.join(', ') || 'no change'
  }

  if (event.type === 'virtual-daa-score-changed') {
    return `score: ${String(data.virtualDaaScore ?? '')}`
  }

  if (event.type === 'sink-blue-score-changed') {
    return `blue score: ${String(data.sinkBlueScore ?? '')}`
  }

  return ''
}

function enrichRpcEventData(event: RpcEvent): Record<string, unknown> {
  const data = event.data as Record<string, unknown> | null ?? {}

  if (event.type === 'block-added') {
    const block = data.block as {
      verboseData?: { hash?: string; blueScore?: string; timestamp?: string }
      transactions?: unknown[]
    } | undefined
    return {
      hash: block?.verboseData?.hash ?? '—',
      blueScore: block?.verboseData?.blueScore ?? '—',
      transactionCount: block?.transactions?.length ?? 0,
    }
  }

  if (event.type === 'utxos-changed') {
    type UtxoEntry = { address?: string; utxoEntry?: { amount?: bigint } }
    const added = data.added as UtxoEntry[] | undefined
    const removed = data.removed as UtxoEntry[] | undefined
    const addedSompi = added?.reduce((s, u) => s + (u.utxoEntry?.amount ?? 0n), 0n) ?? 0n
    const affectedAddresses = [
      ...new Set([
        ...(added?.map((u) => u.address).filter(Boolean) ?? []),
        ...(removed?.map((u) => u.address).filter(Boolean) ?? []),
      ]),
    ]
    return {
      added: added?.length ?? 0,
      removed: removed?.length ?? 0,
      kasReceived: sompiToKas(addedSompi),
      affectedAddresses,
    }
  }

  // Serialize bigints so the devtools panel can display them
  return serializeBigInts(data)
}

function sompiToKas(sompi: bigint): string {
  return (Number(sompi) / 1e8).toFixed(8)
}

function serializeBigInts(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, typeof v === 'bigint' ? v.toString() : v]),
  )
}
