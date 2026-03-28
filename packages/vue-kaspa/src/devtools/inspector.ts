import type { DevtoolsPluginApi } from '@vue/devtools-api'
import type { RpcManagerState } from '../internal/rpc-manager'
import type { WalletManagerState } from '../internal/wallet-manager'
import type { WasmStatus } from '../types'

export const INSPECTOR_ID = 'vue-kaspa'

interface GlobalState {
  wasmStatus: WasmStatus
  rpc: RpcManagerState
  wallet: WalletManagerState
}

export function setupInspector(
  api: DevtoolsPluginApi<Record<string, unknown>>,
  getState: () => GlobalState,
): void {
  api.addInspector({
    id: INSPECTOR_ID,
    label: 'Kaspa SDK',
    icon: 'storage',
  })

  api.on.getInspectorTree((payload) => {
    if (payload.inspectorId !== INSPECTOR_ID) return

    const { wasmStatus, rpc, wallet } = getState()

    payload.rootNodes = [
      {
        id: 'wasm',
        label: `WASM (${wasmStatus})`,
        tags: [{ label: wasmStatus, textColor: 0xffffff, backgroundColor: statusColor(wasmStatus) }],
      },
      {
        id: 'rpc',
        label: `RPC (${rpc.connectionState})`,
        tags: [{ label: rpc.connectionState, textColor: 0xffffff, backgroundColor: connectionColor(rpc.connectionState) }],
      },
      {
        id: 'wallet',
        label: `Wallet (${wallet.walletStatus})`,
        tags: [{ label: wallet.walletStatus, textColor: 0xffffff, backgroundColor: 0x6366f1 }],
      },
      {
        id: 'network',
        label: 'Network',
      },
    ]
  })

  api.on.getInspectorState((payload) => {
    if (payload.inspectorId !== INSPECTOR_ID) return

    const { wasmStatus, rpc, wallet } = getState()

    if (payload.nodeId === 'wasm') {
      payload.state = {
        WASM: [
          { key: 'status', value: wasmStatus },
        ],
      }
    } else if (payload.nodeId === 'rpc') {
      payload.state = {
        Connection: [
          { key: 'state', value: rpc.connectionState },
          { key: 'url', value: rpc.url },
          { key: 'networkId', value: rpc.networkId },
          { key: 'serverVersion', value: rpc.serverVersion },
          { key: 'isSynced', value: rpc.isSynced },
          { key: 'virtualDaaScore', value: String(rpc.virtualDaaScore) },
        ],
      }
    } else if (payload.nodeId === 'wallet') {
      payload.state = {
        Wallet: [
          { key: 'status', value: wallet.walletStatus },
          { key: 'accountCount', value: wallet.accounts.length },
          { key: 'isSyncing', value: wallet.isSyncing },
        ],
        Accounts: wallet.accounts.map((a, i) => ({
          key: `accounts[${i}]`,
          value: {
            id: a.id,
            name: a.name,
            receiveAddress: a.receiveAddress,
            mature: String(a.balance.mature),
            pending: String(a.balance.pending),
          },
        })),
      }
    } else if (payload.nodeId === 'network') {
      payload.state = {
        Network: [
          { key: 'networkId', value: rpc.networkId },
          { key: 'daaScore', value: String(rpc.virtualDaaScore) },
        ],
      }
    }
  })
}

function statusColor(status: WasmStatus): number {
  switch (status) {
    case 'ready': return 0x22c55e
    case 'loading': return 0xf59e0b
    case 'error': return 0xef4444
    default: return 0x6b7280
  }
}

function connectionColor(state: string): number {
  switch (state) {
    case 'connected': return 0x22c55e
    case 'connecting':
    case 'reconnecting': return 0xf59e0b
    case 'error': return 0xef4444
    default: return 0x6b7280
  }
}
