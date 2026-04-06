import { computed, getCurrentInstance, inject, onMounted, onUnmounted, ref } from 'vue'
import { getRpcManager } from '../internal/rpc-manager'
import { KASPA_OPTIONS_KEY } from '../symbols'
import type {
  RpcEvent,
  TransactionListenerOptions,
  UseTransactionListenerReturn,
  VirtualChainResult,
  VueKaspaOptions,
} from '../types'

export function useTransactionListener(options: TransactionListenerOptions = {}): UseTransactionListenerReturn {
  const { maxHistory = 100, autoSubscribe = true } = options

  const pluginOptions = inject<VueKaspaOptions>(KASPA_OPTIONS_KEY, {})
  const manager = getRpcManager()
  const { bridge } = manager

  const transactions = ref<string[]>([])
  const isListening = ref(false)

  function handleVirtualChainChanged(event: RpcEvent<VirtualChainResult>): void {
    const accepted = event.data?.acceptedTransactionIds
    if (!accepted?.length) return

    const ids = accepted.flatMap((entry) => entry.acceptedTransactionIds)
    if (!ids.length) return

    transactions.value = [...ids, ...transactions.value].slice(0, maxHistory)
  }

  async function subscribe(): Promise<void> {
    if (isListening.value) return
    const client = manager.getClient() as { subscribeVirtualChainChanged: (v: boolean) => Promise<void> } | null
    if (!client) return
    await client.subscribeVirtualChainChanged(true)
    bridge.on('virtual-chain-changed', handleVirtualChainChanged as (e: RpcEvent) => void)
    isListening.value = true
  }

  async function unsubscribe(): Promise<void> {
    if (!isListening.value) return
    bridge.off('virtual-chain-changed', handleVirtualChainChanged as (e: RpcEvent) => void)
    isListening.value = false
    const client = manager.getClient() as { unsubscribeVirtualChainChanged: (v: boolean) => Promise<void> } | null
    if (client) {
      await client.unsubscribeVirtualChainChanged(true)
    }
  }

  function clear(): void {
    transactions.value = []
  }

  if (autoSubscribe) {
    if (getCurrentInstance()) {
      onMounted(async () => {
        if (manager.state.connectionState === 'connected') {
          await subscribe()
        } else {
          // Wait for connection then subscribe
          const connectHandler = async (event: RpcEvent) => {
            if (event.type === 'connect') {
              bridge.off('connect', connectHandler)
              await subscribe()
            }
          }
          bridge.on('connect', connectHandler)
        }
      })

      onUnmounted(async () => {
        await unsubscribe()
      })
    }
  }

  return {
    transactions: transactions as UseTransactionListenerReturn['transactions'],
    isListening: computed(() => isListening.value),
    subscribe,
    unsubscribe,
    clear,
  }
}
