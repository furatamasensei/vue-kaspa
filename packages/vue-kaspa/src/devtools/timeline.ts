import type { RpcEvent } from '../types'

export const TIMELINE_LAYER_ID = 'kaspa-events'

// Use `any` for the api type — @vue/devtools-api v8 changed its public API
// surface but still provides runtime backwards-compatibility for plugin setup.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DevtoolsApi = any

export function setupTimeline(api: DevtoolsApi): void {
  api.addTimelineLayer({
    id: TIMELINE_LAYER_ID,
    label: 'Kaspa Events',
    color: 0x4caf50,
  })
}

export function postTimelineEvent(
  api: DevtoolsApi,
  event: RpcEvent,
): void {
  const logType =
    event.type === 'finality-conflict' ? 'warning'
    : event.type === 'disconnect' ? 'error'
    : 'default'

  api.addTimelineEvent({
    layerId: TIMELINE_LAYER_ID,
    event: {
      time: api.now(),
      title: event.type,
      subtitle: summarize(event),
      data: event.data as Record<string, unknown>,
      groupId: event.type,
      logType,
    },
  })
}

function summarize(event: RpcEvent): string {
  const data = event.data as Record<string, unknown> | null
  if (!data) return ''
  if (event.type === 'block-added') {
    const block = data.block as { verboseData?: { hash?: string } } | undefined
    return block?.verboseData?.hash ? `hash: ${block.verboseData.hash.slice(0, 12)}...` : ''
  }
  if (event.type === 'virtual-daa-score-changed') {
    return `score: ${String(data.virtualDaaScore ?? '')}`
  }
  if (event.type === 'sink-blue-score-changed') {
    return `blue score: ${String(data.sinkBlueScore ?? '')}`
  }
  return ''
}
