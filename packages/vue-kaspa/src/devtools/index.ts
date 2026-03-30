import { setupDevtoolsPlugin } from '@vue/devtools-api'
import type { App } from 'vue'
import { watch } from 'vue'
import { getRpcManager } from '../internal/rpc-manager'
import { getWasmState } from '../internal/wasm-loader'
import { INSPECTOR_ID, setupInspector } from './inspector'
import { postTimelineEvent, setupTimeline } from './timeline'

const LOGO =
  'data:image/png;base64,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'

export function setupDevtools(app: App): void {
  if (typeof window === 'undefined') return

  setupDevtoolsPlugin(
    {
      id: 'vue-kaspa',
      label: 'Kaspa SDK',
      packageName: 'vue-kaspa',
      homepage: 'https://github.com/kaspanet/vue-kaspa',
      logo: LOGO,
      app,
      settings: {},
      enableEarlyProxy: true,
    },
    (api) => {
      const rpcManager = getRpcManager()

      setupTimeline(api)
      setupInspector(api, () => ({
        wasmStatus: getWasmState().status,
        rpc: rpcManager.state,
      }))

      // Bridge all RPC events to the DevTools timeline
      const allEvents = [
        'block-added', 'virtual-chain-changed', 'utxos-changed',
        'finality-conflict', 'finality-conflict-resolved', 'sink-blue-score-changed',
        'virtual-daa-score-changed', 'new-block-template',
        'connect', 'disconnect',
      ] as const

      for (const eventType of allEvents) {
        rpcManager.bridge.on(eventType, (event) => {
          postTimelineEvent(api, event)
        })
      }

      // Refresh inspector when state changes
      watch(
        () => rpcManager.state.connectionState,
        () => {
          api.sendInspectorState(INSPECTOR_ID)
          api.sendInspectorTree(INSPECTOR_ID)
        },
      )

      watch(
        () => getWasmState().status,
        () => {
          api.sendInspectorState(INSPECTOR_ID)
          api.sendInspectorTree(INSPECTOR_ID)
        },
      )
    },
  )
}
