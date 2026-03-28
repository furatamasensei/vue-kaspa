import { getRpcManager } from '../internal/rpc-manager'
import { ensureWasmInit } from '../internal/wasm-loader'
import { getKaspa } from '../internal/kaspa'
import { inject } from 'vue'
import { KASPA_OPTIONS_KEY } from '../symbols'
import type { KaspaPluginOptions, CreateTransactionSettings, TransactionSummary, PendingTx, UseTransactionReturn } from '../types'

type AnyPendingTx = {
  sign(keys: (string | Uint8Array)[]): void
  serializeToObject(): unknown
  addresses(): Array<{ toString(): string }>
}

type AnySummary = {
  fees: bigint
  mass: bigint
  transactions: number
  finalTransactionId?: string
  finalAmount?: bigint
}

function mapSummary(s: AnySummary): TransactionSummary {
  const result: TransactionSummary = {
    fees: s.fees,
    mass: s.mass,
    transactions: s.transactions,
  }
  if (s.finalTransactionId !== undefined) result.finalTransactionId = s.finalTransactionId
  if (s.finalAmount !== undefined) result.finalAmount = s.finalAmount
  return result
}

function wrapPending(pending: AnyPendingTx, manager: ReturnType<typeof getRpcManager>): PendingTx {
  return {
    sign(privateKeys: string[]): void {
      pending.sign(privateKeys)
    },

    async submit(): Promise<string> {
      const client = manager.getClient() as {
        submitTransaction: (req: unknown) => Promise<{ transactionId: string }>
      } | null
      if (!client) throw new Error('Not connected to Kaspa node')
      const { transactionId } = await client.submitTransaction({
        transaction: pending.serializeToObject(),
        allowOrphan: false,
      })
      return transactionId
    },

    serialize(): unknown {
      return pending.serializeToObject()
    },

    addresses(): string[] {
      return pending.addresses().map((a) => a.toString())
    },
  }
}

export function useTransaction(): UseTransactionReturn {
  const pluginOptions = inject<KaspaPluginOptions>(KASPA_OPTIONS_KEY, {})
  const manager = getRpcManager()

  function toGeneratorSettings(settings: CreateTransactionSettings): Record<string, unknown> {
    return {
      entries: settings.entries,
      outputs: settings.outputs ?? [],
      changeAddress: settings.changeAddress,
      priorityFee: settings.priorityFee,
      feeRate: settings.feeRate,
      payload: settings.payload,
      networkId: settings.networkId ?? pluginOptions.network ?? 'mainnet',
    }
  }

  async function estimate(settings: CreateTransactionSettings): Promise<TransactionSummary> {
    await ensureWasmInit(pluginOptions)
    const { estimateTransactions } = getKaspa()
    const summary = await estimateTransactions(toGeneratorSettings(settings) as unknown as Parameters<typeof estimateTransactions>[0])
    return mapSummary(summary as AnySummary)
  }

  async function create(settings: CreateTransactionSettings): Promise<{ transactions: PendingTx[]; summary: TransactionSummary }> {
    await ensureWasmInit(pluginOptions)
    const { createTransactions } = getKaspa()
    const result = await createTransactions(toGeneratorSettings(settings) as unknown as Parameters<typeof createTransactions>[0])
    const r = result as { transactions: AnyPendingTx[]; summary: AnySummary }
    return {
      transactions: r.transactions.map((p) => wrapPending(p, manager)),
      summary: mapSummary(r.summary),
    }
  }

  async function send(settings: CreateTransactionSettings & { privateKeys: string[] }): Promise<string[]> {
    const { transactions } = await create(settings)
    const txIds: string[] = []
    for (const tx of transactions) {
      tx.sign(settings.privateKeys)
      txIds.push(await tx.submit())
    }
    return txIds
  }

  return { estimate, create, send }
}
