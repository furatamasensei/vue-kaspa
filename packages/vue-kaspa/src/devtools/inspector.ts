import type { RpcManagerState } from '../internal/rpc-manager'
import type { WalletProvider, WalletBalance } from '../types'
import type { WasmStatus } from '../types'
import type { UtxoInstanceSnapshot } from '../composables/useUtxo'

export const INSPECTOR_ID = 'vue-kaspa'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DevtoolsApi = any

// ─── Colors ────────────────────────────────────────────────────────────────

const COLOR = {
  green:  0x49c5a3,
  blue:   0x2196f3,
  orange: 0xff9800,
  red:    0xf44336,
  gray:   0x9e9e9e,
  purple: 0x9c27b0,
  white:  0xffffff,
}

// ─── State shape ───────────────────────────────────────────────────────────

export interface InspectorState {
  wasmStatus: WasmStatus
  wasmError: Error | null
  rpc: RpcManagerState
  rpcEventLog: Array<{ type: string; summary: string; time: number }>
  utxoInstances: UtxoInstanceSnapshot[]
  wallet: {
    provider: WalletProvider | null
    address: string | null
    publicKey: string | null
    balance: WalletBalance | null
    network: string | null
  }
  currentNetwork: string
}

// ─── Setup ────────────────────────────────────────────────────────────────

export function setupInspector(api: DevtoolsApi, getState: () => InspectorState): void {
  api.addInspector({
    id: INSPECTOR_ID,
    label: 'Vue Kaspa',
    icon: 'storage',
  })

  // ── Tree ────────────────────────────────────────────────────────────────

  api.on.getInspectorTree((payload: { inspectorId: string; rootNodes: unknown[] }) => {
    if (payload.inspectorId !== INSPECTOR_ID) return
    const s = getState()

    payload.rootNodes = [
      wasmNode(s),
      networkNode(s),
      rpcNode(s),
      utxoNode(s),
      walletNode(s),
    ]
  })

  // ── State ───────────────────────────────────────────────────────────────

  api.on.getInspectorState((payload: { inspectorId: string; nodeId: string; state: unknown }) => {
    if (payload.inspectorId !== INSPECTOR_ID) return
    const s = getState()
    const nodeId = payload.nodeId

    if (nodeId === 'wasm')        { payload.state = wasmState(s); return }
    if (nodeId === 'network')     { payload.state = networkState(s); return }
    if (nodeId === 'rpc')         { payload.state = rpcState(s); return }
    if (nodeId === 'rpc-eventlog'){ payload.state = eventLogState(s); return }
    if (nodeId === 'utxo')        { payload.state = utxoRootState(s); return }
    if (nodeId === 'wallet')      { payload.state = walletState(s); return }

    // utxo-{id} instance nodes
    if (nodeId.startsWith('utxo-')) {
      const id = parseInt(nodeId.slice(5), 10)
      const instance = s.utxoInstances.find((i) => i.id === id)
      if (instance) payload.state = utxoInstanceState(instance)
    }
  })
}

// ─── Node builders ─────────────────────────────────────────────────────────

function wasmNode(s: InspectorState) {
  return {
    id: 'wasm',
    label: 'WASM',
    tags: [statusTag(s.wasmStatus, wasmStatusColor(s.wasmStatus))],
  }
}

function networkNode(s: InspectorState) {
  return {
    id: 'network',
    label: 'Network',
    tags: [{ label: s.currentNetwork, textColor: COLOR.white, backgroundColor: COLOR.blue }],
  }
}

function rpcNode(s: InspectorState) {
  return {
    id: 'rpc',
    label: 'RPC',
    tags: [statusTag(s.rpc.connectionState, rpcStateColor(s.rpc.connectionState))],
    children: [
      {
        id: 'rpc-eventlog',
        label: 'Event Log',
        tags: [{ label: `${s.rpcEventLog.length} events`, textColor: COLOR.white, backgroundColor: COLOR.gray }],
      },
    ],
  }
}

function utxoNode(s: InspectorState) {
  const total = s.utxoInstances.reduce((n, i) => n + i.trackedAddresses.length, 0)
  return {
    id: 'utxo',
    label: 'UTXO Tracking',
    tags: [
      { label: `${s.utxoInstances.length} instance${s.utxoInstances.length !== 1 ? 's' : ''}`, textColor: COLOR.white, backgroundColor: COLOR.gray },
      ...(total > 0 ? [{ label: `${total} address${total !== 1 ? 'es' : ''}`, textColor: COLOR.white, backgroundColor: COLOR.green }] : []),
    ],
    children: s.utxoInstances.map((instance) => ({
      id: `utxo-${instance.id}`,
      label: `Instance #${instance.id}`,
      tags: [
        { label: `${instance.trackedAddresses.length} addr`, textColor: COLOR.white, backgroundColor: COLOR.gray },
        { label: `${sompiToKas(instance.mature + instance.pending)} KAS`, textColor: COLOR.white, backgroundColor: COLOR.green },
      ],
    })),
  }
}

function walletNode(s: InspectorState) {
  const connected = s.wallet.provider !== null
  return {
    id: 'wallet',
    label: 'Wallet',
    tags: connected
      ? [
          statusTag(s.wallet.provider!, walletColor(s.wallet.provider)),
          ...(s.wallet.network ? [{ label: s.wallet.network, textColor: COLOR.white, backgroundColor: COLOR.blue }] : []),
        ]
      : [{ label: 'not connected', textColor: COLOR.white, backgroundColor: COLOR.gray }],
  }
}

// ─── State builders ─────────────────────────────────────────────────────────

function wasmState(s: InspectorState) {
  return {
    WASM: [
      { key: 'status', value: s.wasmStatus },
      { key: 'error', value: s.wasmError?.message ?? null },
    ],
  }
}

function networkState(s: InspectorState) {
  return {
    Network: [
      { key: 'selected', value: s.currentNetwork },
      { key: 'node networkId', value: s.rpc.networkId ?? '—' },
      { key: 'DAA score', value: s.rpc.virtualDaaScore.toString() },
      { key: 'server version', value: s.rpc.serverVersion ?? '—' },
      { key: 'synced', value: s.rpc.isSynced },
    ],
  }
}

function rpcState(s: InspectorState) {
  return {
    Connection: [
      { key: 'state', value: s.rpc.connectionState },
      { key: 'url', value: s.rpc.url ?? '—' },
      { key: 'error', value: s.rpc.error?.message ?? null },
    ],
  }
}

function eventLogState(s: InspectorState) {
  const last10 = s.rpcEventLog.slice(-10).reverse()
  return {
    'Recent Events': last10.map((e) => ({
      key: new Date(e.time).toLocaleTimeString(),
      value: e.summary ? `${e.type} — ${e.summary}` : e.type,
    })),
    Info: [
      { key: 'total buffered', value: s.rpcEventLog.length },
    ],
  }
}

function utxoRootState(s: InspectorState) {
  const total = s.utxoInstances.reduce((n, i) => n + i.trackedAddresses.length, 0)
  const totalMature = s.utxoInstances.reduce((n, i) => n + i.mature, 0n)
  const totalPending = s.utxoInstances.reduce((n, i) => n + i.pending, 0n)
  return {
    Summary: [
      { key: 'active instances', value: s.utxoInstances.length },
      { key: 'tracked addresses', value: total },
      { key: 'total mature KAS', value: sompiToKas(totalMature) },
      { key: 'total pending KAS', value: sompiToKas(totalPending) },
    ],
  }
}

function utxoInstanceState(i: UtxoInstanceSnapshot) {
  return {
    Addresses: i.trackedAddresses.map((addr, idx) => ({
      key: String(idx),
      value: addr,
    })),
    Balance: [
      { key: 'mature KAS', value: sompiToKas(i.mature) },
      { key: 'pending KAS', value: sompiToKas(i.pending) },
      { key: 'total KAS', value: sompiToKas(i.mature + i.pending) },
      { key: 'UTXO count', value: i.entryCount },
    ],
  }
}

function walletState(s: InspectorState) {
  if (!s.wallet.provider) {
    return { Wallet: [{ key: 'status', value: 'not connected' }] }
  }
  const bal = s.wallet.balance
  const sections: Record<string, unknown[]> = {
    Connection: [
      { key: 'provider', value: s.wallet.provider },
      { key: 'address', value: s.wallet.address ?? '—' },
      { key: 'public key', value: s.wallet.publicKey ?? '—' },
      { key: 'network', value: s.wallet.network ?? '—' },
    ],
  }
  if (bal) {
    sections['Balance'] = [
      { key: 'total KAS', value: sompiToKas(bal.total) },
      { key: 'confirmed KAS', value: sompiToKas(bal.confirmed) },
      { key: 'unconfirmed KAS', value: sompiToKas(bal.unconfirmed) },
    ]
  }
  return sections
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function statusTag(label: string, backgroundColor: number) {
  return { label, textColor: COLOR.white, backgroundColor }
}

function wasmStatusColor(status: WasmStatus): number {
  return { idle: COLOR.gray, loading: COLOR.blue, ready: COLOR.green, error: COLOR.red }[status] ?? COLOR.gray
}

function rpcStateColor(state: string): number {
  return (
    { disconnected: COLOR.gray, connecting: COLOR.blue, connected: COLOR.green, reconnecting: COLOR.orange, error: COLOR.red }[state]
    ?? COLOR.gray
  )
}

function walletColor(provider: WalletProvider | null): number {
  return provider === 'kasware' ? COLOR.green : provider === 'kastle' ? COLOR.purple : COLOR.gray
}

function sompiToKas(sompi: bigint): string {
  return (Number(sompi) / 1e8).toFixed(4)
}
