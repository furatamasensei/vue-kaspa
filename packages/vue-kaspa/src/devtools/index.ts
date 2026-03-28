import type { App } from 'vue'
import { watch } from 'vue'
import { setupDevtoolsPlugin } from '@vue/devtools-api'
import { setupInspector, INSPECTOR_ID } from './inspector'
import { setupTimeline, postTimelineEvent } from './timeline'
import { getRpcManager } from '../internal/rpc-manager'
import { getWasmState } from '../internal/wasm-loader'
import { getWalletManager } from '../internal/wallet-manager'

export function setupDevtools(app: App): void {
  if (typeof window === 'undefined') return

  setupDevtoolsPlugin(
    {
      id: 'vue-kaspa',
      label: 'Kaspa SDK',
      packageName: 'vue-kaspa',
      homepage: 'https://github.com/kaspanet/vue-kaspa',
      app,
      settings: {},
      enableEarlyProxy: true,
    },
    (api) => {
      const rpcManager = getRpcManager()
      const walletManager = getWalletManager()

      setupTimeline(api)
      setupInspector(api, () => ({
        wasmStatus: getWasmState().status,
        rpc: rpcManager.state,
        wallet: walletManager.state,
      }))

      // Bridge all RPC events to the DevTools timeline
      const allEvents = [
        'blockAdded', 'virtualChainChanged', 'utxosChanged',
        'finalityConflict', 'finalityConflictResolved', 'sinkBlueScoreChanged',
        'virtualDaaScoreChanged', 'newBlockTemplate', 'syncStateChanged',
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
        () => walletManager.state.walletStatus,
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
