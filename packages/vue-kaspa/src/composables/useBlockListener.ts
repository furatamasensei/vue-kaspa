import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { getRpcManager } from '../internal/rpc-manager'
import { KASPA_OPTIONS_KEY } from '../symbols'
import type {
  BlockInfo,
  BlockListenerOptions,
  RpcEvent,
  UseBlockListenerReturn,
  VueKaspaOptions,
} from '../types'

type RawBlock = {
  verboseData: { hash: string; timestamp: string; blueScore: string }
  transactions: Array<{ verboseData?: { transactionId: string } }>
}

function mapBlock(raw: RawBlock): BlockInfo {
  return {
    hash: raw.verboseData.hash,
    timestamp: parseInt(raw.verboseData.timestamp),
    blueScore: BigInt(raw.verboseData.blueScore),
    transactions: raw.transactions.map((t) => t.verboseData?.transactionId ?? ''),
  }
}

export function useBlockListener(options: BlockListenerOptions = {}): UseBlockListenerReturn {
  const { maxHistory = 100, autoSubscribe = true } = options

  inject<VueKaspaOptions>(KASPA_OPTIONS_KEY, {})
  const manager = getRpcManager()
  const { bridge } = manager

  const blocks = ref<BlockInfo[]>([])
  const isListening = ref(false)

  function handleBlockAdded(event: RpcEvent<{ block: RawBlock }>): void {
    if (!event.data?.block) return
    const block = mapBlock(event.data.block)
    blocks.value = [block, ...blocks.value].slice(0, maxHistory)
  }

  async function subscribe(): Promise<void> {
    if (isListening.value) return
    const client = manager.getClient() as { subscribeBlockAdded: () => Promise<void> } | null
    if (!client) return
    await client.subscribeBlockAdded()
    bridge.on('block-added', handleBlockAdded as (e: RpcEvent) => void)
    isListening.value = true
  }

  async function unsubscribe(): Promise<void> {
    if (!isListening.value) return
    bridge.off('block-added', handleBlockAdded as (e: RpcEvent) => void)
    isListening.value = false
    const client = manager.getClient() as { unsubscribeBlockAdded: () => Promise<void> } | null
    if (client) {
      await client.unsubscribeBlockAdded()
    }
  }

  function clear(): void {
    blocks.value = []
  }

  if (autoSubscribe) {
    onMounted(async () => {
      if (manager.state.connectionState === 'connected') {
        await subscribe()
      } else {
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

  return {
    blocks: blocks as UseBlockListenerReturn['blocks'],
    isListening: computed(() => isListening.value),
    subscribe,
    unsubscribe,
    clear,
  }
}
