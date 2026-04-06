import { computed, getCurrentInstance, inject, onMounted, onUnmounted, ref } from 'vue'
import { getKaspa } from '../internal/kaspa'
import { getRpcManager } from '../internal/rpc-manager'
import { KASPA_OPTIONS_KEY } from '../symbols'
import type {
  AcceptedTransactionInfo,
  RpcEvent,
  TransactionListenerOptions,
  UseTransactionListenerReturn,
  VirtualChainResult,
  VueKaspaOptions,
} from '../types'

export function useTransactionListener(options: TransactionListenerOptions = {}): UseTransactionListenerReturn {
  const { maxHistory = 100, autoSubscribe = true, includeSenderAddresses = false } = options

  const pluginOptions = inject<VueKaspaOptions>(KASPA_OPTIONS_KEY, {})
  const manager = getRpcManager()
  const { bridge } = manager

  const transactions = ref<string[]>([])
  const acceptedTransactions = ref<AcceptedTransactionInfo[]>([])
  const isListening = ref(false)

  function mergeTransactions(newTransactions: AcceptedTransactionInfo[]): void {
    const ids = new Set(newTransactions.map((tx) => tx.transactionId))
    acceptedTransactions.value = [...newTransactions, ...acceptedTransactions.value.filter((tx) => !ids.has(tx.transactionId))].slice(0, maxHistory)
    transactions.value = acceptedTransactions.value.map((tx) => tx.transactionId)
  }

  async function resolveAcceptedTransactions(entries: Array<{ acceptingBlockHash: string; acceptedTransactionIds: string[] }>): Promise<void> {
    const client = manager.getClient() as {
      getBlock: (req: unknown) => Promise<{ block: { transactions: unknown[] } }>
    } | null
    if (!client) return

    const network = pluginOptions.network ?? manager.state.networkId ?? 'mainnet'
    const kaspa = getKaspa()
    const uniqueBlocks = Array.from(new Set(entries.map((entry) => entry.acceptingBlockHash)))

    const blockResults = await Promise.all(
      uniqueBlocks.map(async (hash) => {
        const result = await client.getBlock({ hash, includeTransactions: true })
        const transactions = result.block.transactions ?? []
        const senderByTransactionId = new Map<string, string[]>()

        for (const rawTransaction of transactions) {
          const transaction = new kaspa.Transaction(rawTransaction as never)
          senderByTransactionId.set(
            transaction.id,
            transaction.addresses(network).map((address: { toString(): string }) => address.toString()),
          )
        }

        return { hash, senderByTransactionId }
      }),
    )

    const senderByTransactionId = new Map<string, string[]>()
    for (const result of blockResults) {
      for (const [transactionId, senderAddresses] of result.senderByTransactionId) {
        senderByTransactionId.set(transactionId, senderAddresses)
      }
    }

    acceptedTransactions.value = acceptedTransactions.value.map((entry) => ({
      ...entry,
      senderAddresses: senderByTransactionId.get(entry.transactionId) ?? entry.senderAddresses,
    }))
  }

  function handleVirtualChainChanged(event: RpcEvent<VirtualChainResult>): void {
    const accepted = event.data?.acceptedTransactionIds
    if (!accepted?.length) return

    const ids = accepted.flatMap((entry) => entry.acceptedTransactionIds)
    if (!ids.length) return

    const nextAcceptedTransactions = accepted.flatMap((entry) =>
      entry.acceptedTransactionIds.map((transactionId) => ({
        transactionId,
        acceptingBlockHash: entry.acceptingBlockHash,
        senderAddresses: [],
      })),
    )

    mergeTransactions(nextAcceptedTransactions)

    if (includeSenderAddresses) {
      resolveAcceptedTransactions(accepted).catch(() => undefined)
    }
  }

  async function resolveSenderAddresses(transactionId: string): Promise<string[]> {
    const entry = acceptedTransactions.value.find((tx) => tx.transactionId === transactionId)
    if (!entry) return []
    if (entry.senderAddresses.length > 0) return entry.senderAddresses

    const client = manager.getClient() as {
      getBlock: (req: unknown) => Promise<{ block: { transactions: unknown[] } }>
    } | null
    if (!client) return []

    const network = pluginOptions.network ?? manager.state.networkId ?? 'mainnet'
    const kaspa = getKaspa()
    const result = await client.getBlock({ hash: entry.acceptingBlockHash, includeTransactions: true })
    const resolved = new Map<string, string[]>()

    for (const rawTransaction of result.block.transactions ?? []) {
      const transaction = new kaspa.Transaction(rawTransaction as never)
      resolved.set(
        transaction.id,
        transaction.addresses(network).map((address: { toString(): string }) => address.toString()),
      )
    }

    acceptedTransactions.value = acceptedTransactions.value.map((tx) => ({
      ...tx,
      senderAddresses: resolved.get(tx.transactionId) ?? tx.senderAddresses,
    }))

    return resolved.get(transactionId) ?? []
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
    acceptedTransactions.value = []
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
    acceptedTransactions: acceptedTransactions as UseTransactionListenerReturn['acceptedTransactions'],
    isListening: computed(() => isListening.value),
    subscribe,
    unsubscribe,
    clear,
    resolveSenderAddresses,
  }
}
