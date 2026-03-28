import { ref, computed, readonly, getCurrentInstance, onUnmounted } from 'vue'
import { getRpcManager } from '../internal/rpc-manager'
import type { UtxoEntry, UtxoBalance, UseUtxoReturn } from '../types'

export function useUtxo(): UseUtxoReturn {
  const manager = getRpcManager()

  const entries = ref<UtxoEntry[]>([])
  const trackedAddresses = ref<string[]>([])

  const balance = computed<UtxoBalance>(() => {
    let mature = 0n
    let pending = 0n
    for (const e of entries.value) {
      if (e.isCoinbase) {
        // Coinbase UTXOs may have a maturity delay — treat as pending conservatively
        pending += e.amount
      } else {
        mature += e.amount
      }
    }
    return { mature, pending, outgoing: 0n }
  })

  // Handler registered on the event bridge to refresh on UTXO changes
  let bridgeHandler: ((e: unknown) => void) | null = null

  function startListening(): void {
    if (bridgeHandler) return
    bridgeHandler = () => { refresh().catch(() => undefined) }
    manager.bridge.on('utxos-changed', bridgeHandler as (e: import('../types').RpcEvent) => void)
  }

  function stopListening(): void {
    if (!bridgeHandler) return
    manager.bridge.off('utxos-changed', bridgeHandler as (e: import('../types').RpcEvent) => void)
    bridgeHandler = null
  }

  async function refresh(): Promise<void> {
    if (!trackedAddresses.value.length) {
      entries.value = []
      return
    }
    const client = manager.getClient() as { getUtxosByAddresses: (req: unknown) => Promise<{ entries: UtxoEntry[] }> } | null
    if (!client) return
    const result = await client.getUtxosByAddresses({ addresses: trackedAddresses.value })
    entries.value = result.entries ?? []
  }

  async function track(addresses: string[]): Promise<void> {
    const newAddresses = addresses.filter((a) => !trackedAddresses.value.includes(a))
    if (!newAddresses.length) return

    trackedAddresses.value = [...trackedAddresses.value, ...newAddresses]
    startListening()

    const client = manager.getClient() as { subscribeUtxosChanged: (a: string[]) => Promise<void> } | null
    if (client) {
      await client.subscribeUtxosChanged(newAddresses)
    }
    await refresh()
  }

  async function untrack(addresses: string[]): Promise<void> {
    const client = manager.getClient() as { unsubscribeUtxosChanged: (a: string[]) => Promise<void> } | null
    if (client) {
      await client.unsubscribeUtxosChanged(addresses).catch(() => undefined)
    }
    trackedAddresses.value = trackedAddresses.value.filter((a) => !addresses.includes(a))
    if (!trackedAddresses.value.length) {
      stopListening()
      entries.value = []
    } else {
      await refresh()
    }
  }

  async function clear(): Promise<void> {
    if (trackedAddresses.value.length) {
      const client = manager.getClient() as { unsubscribeUtxosChanged: (a: string[]) => Promise<void> } | null
      if (client) {
        await client.unsubscribeUtxosChanged(trackedAddresses.value).catch(() => undefined)
      }
    }
    stopListening()
    trackedAddresses.value = []
    entries.value = []
  }

  // Auto-cleanup when used inside a Vue component
  if (getCurrentInstance()) {
    onUnmounted(() => { clear().catch(() => undefined) })
  }

  return {
    entries: readonly(entries) as UseUtxoReturn['entries'],
    balance,
    trackedAddresses: readonly(trackedAddresses) as UseUtxoReturn['trackedAddresses'],
    isTracking: computed(() => trackedAddresses.value.length > 0),
    track,
    untrack,
    refresh,
    clear,
  }
}
