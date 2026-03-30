import { setupDevtoolsPlugin } from '@vue/devtools-api'
import type { App } from 'vue'
import { watch } from 'vue'
import { getCurrentNetworkRef } from '../composables/useNetwork'
import { getUtxoSnapshots } from '../composables/useUtxo'
import { getWalletStateRefs } from '../composables/useWallet'
import { getRpcManager } from '../internal/rpc-manager'
import { getWasmState } from '../internal/wasm-loader'
import type { InspectorState } from './inspector'
import { INSPECTOR_ID, setupInspector } from './inspector'
import {
  postLifecycleEvent,
  postRpcEvent,
  postWalletEvent,
  setupTimeline,
} from './timeline'

export function setupDevtools(app: App): void {
  if (typeof window === 'undefined') return

  setupDevtoolsPlugin(
    {
      id: 'vue-kaspa',
      label: 'Vue Kaspa',
      packageName: 'vue-kaspa',
      homepage: 'https://github.com/furatamasensei/vue-kaspa',
      logo: 'https://raw.githubusercontent.com/furatamasensei/vue-kaspa/main/docs/public/logo.png',
      app,
      settings: {},
      enableEarlyProxy: true,
    },
    (api) => {
      const rpcManager = getRpcManager()
      const walletRefs = getWalletStateRefs()
      const currentNetworkRef = getCurrentNetworkRef()

      setupTimeline(api)
      setupInspector(api, buildState)

      // ── RPC events → timeline ──────────────────────────────────────────

      const rpcEvents = [
        'block-added', 'virtual-chain-changed', 'utxos-changed',
        'finality-conflict', 'finality-conflict-resolved', 'sink-blue-score-changed',
        'virtual-daa-score-changed', 'new-block-template',
        'connect', 'disconnect',
      ] as const

      for (const eventType of rpcEvents) {
        rpcManager.bridge.on(eventType, (event) => {
          postRpcEvent(api, event)
        })
      }

      // UTXO changes also refresh the inspector (balance / entry counts changed)
      rpcManager.bridge.on('utxos-changed', () => {
        api.sendInspectorState(INSPECTOR_ID)
        api.sendInspectorTree(INSPECTOR_ID)
      })

      // ── RPC lifecycle → timeline + inspector ───────────────────────────

      let connectingAt = 0

      watch(
        () => rpcManager.state.connectionState,
        (next, prev) => {
          api.sendInspectorState(INSPECTOR_ID)
          api.sendInspectorTree(INSPECTOR_ID)

          if (next === 'connecting') {
            connectingAt = Date.now()
            postLifecycleEvent(api, 'rpc: connecting', { url: rpcManager.state.url ?? 'resolver' })
          } else if (next === 'connected') {
            const ms = connectingAt ? Date.now() - connectingAt : null
            postLifecycleEvent(api, 'rpc: connected', {
              url: rpcManager.state.url,
              networkId: rpcManager.state.networkId,
              serverVersion: rpcManager.state.serverVersion,
              ...(ms !== null && { durationMs: ms }),
            })
          } else if (next === 'reconnecting') {
            postLifecycleEvent(api, 'rpc: reconnecting', { previousState: prev }, 'warning')
          } else if (next === 'disconnected') {
            postLifecycleEvent(api, 'rpc: disconnected', {})
          } else if (next === 'error') {
            postLifecycleEvent(api, 'rpc: error', { error: rpcManager.state.error?.message }, 'error')
          }
        },
      )

      // ── WASM lifecycle → timeline + inspector ──────────────────────────

      let wasmInitAt = 0

      watch(
        () => getWasmState().status,
        (next) => {
          api.sendInspectorState(INSPECTOR_ID)
          api.sendInspectorTree(INSPECTOR_ID)

          if (next === 'loading') {
            wasmInitAt = Date.now()
            postLifecycleEvent(api, 'wasm: initializing', {})
          } else if (next === 'ready') {
            const ms = wasmInitAt ? Date.now() - wasmInitAt : null
            postLifecycleEvent(api, 'wasm: ready', {
              ...(ms !== null && { durationMs: ms }),
            })
          } else if (next === 'error') {
            postLifecycleEvent(api, 'wasm: error', { error: getWasmState().error?.message ?? 'unknown' }, 'error')
          }
        },
      )

      // ── Network switches → lifecycle timeline ──────────────────────────

      watch(currentNetworkRef, (next, prev) => {
        postLifecycleEvent(api, 'network: switched', { from: prev, to: next })
        api.sendInspectorState(INSPECTOR_ID)
        api.sendInspectorTree(INSPECTOR_ID)
      })

      // ── Wallet events → wallet timeline + inspector ────────────────────

      watch(walletRefs.provider, (next, prev) => {
        api.sendInspectorState(INSPECTOR_ID)
        api.sendInspectorTree(INSPECTOR_ID)

        if (next && !prev) {
          postWalletEvent(api, 'wallet: connected', {
            provider: next,
            address: walletRefs.address.value,
            network: walletRefs.network.value,
          })
        } else if (!next && prev) {
          postWalletEvent(api, 'wallet: disconnected', { provider: prev })
        }
      })

      watch(walletRefs.address, (next, prev) => {
        if (!next || !prev || next === prev) return
        postWalletEvent(api, 'wallet: account changed', { from: prev, to: next })
        api.sendInspectorState(INSPECTOR_ID)
      })

      watch(walletRefs.network, (next, prev) => {
        if (!next || next === prev) return
        postWalletEvent(api, 'wallet: network changed', { from: prev, to: next })
        api.sendInspectorState(INSPECTOR_ID)
        api.sendInspectorTree(INSPECTOR_ID)
      })

      watch(walletRefs.balance, (next) => {
        if (!next) return
        const kas = (Number(next.total) / 1e8).toFixed(4)
        postWalletEvent(api, 'wallet: balance changed', {
          totalKAS: kas,
          confirmedKAS: (Number(next.confirmed) / 1e8).toFixed(4),
          unconfirmedKAS: (Number(next.unconfirmed) / 1e8).toFixed(4),
        })
        api.sendInspectorState(INSPECTOR_ID)
      })

      // ── Helpers ────────────────────────────────────────────────────────

      function buildState(): InspectorState {
        const wasmState = getWasmState()
        const eventLog = rpcManager.eventLog.value.map((e) => ({
          type: e.type,
          summary: summarizeEvent(e),
          time: e.timestamp,
        }))

        return {
          wasmStatus: wasmState.status,
          wasmError: wasmState.error ?? null,
          rpc: rpcManager.state,
          rpcEventLog: eventLog,
          utxoInstances: getUtxoSnapshots(),
          wallet: {
            provider: walletRefs.provider.value,
            address: walletRefs.address.value,
            publicKey: walletRefs.publicKey.value,
            balance: walletRefs.balance.value,
            network: walletRefs.network.value,
          },
          currentNetwork: currentNetworkRef.value,
        }
      }
    },
  )
}

function summarizeEvent(event: { type: string; data: unknown }): string {
  const data = event.data as Record<string, unknown> | null
  if (!data) return ''
  if (event.type === 'block-added') {
    const vd = (data.block as { verboseData?: { hash?: string } } | undefined)?.verboseData
    return vd?.hash ? `#${vd.hash.slice(0, 10)}…` : ''
  }
  if (event.type === 'utxos-changed') {
    const added = (data.added as unknown[] | undefined)?.length ?? 0
    const removed = (data.removed as unknown[] | undefined)?.length ?? 0
    return [added && `+${added}`, removed && `−${removed}`].filter(Boolean).join(' ')
  }
  if (event.type === 'virtual-daa-score-changed') return `score: ${data.virtualDaaScore}`
  if (event.type === 'sink-blue-score-changed') return `blue: ${data.sinkBlueScore}`
  return ''
}
