import { computed, readonly } from 'vue'
import { inject } from 'vue'
import { getWalletManager } from '../internal/wallet-manager'
import { ensureWasmInit } from '../internal/wasm-loader'
import { KASPA_OPTIONS_KEY } from '../symbols'
import type {
  KaspaPluginOptions,
  UseWalletReturn,
  WalletCreateParams,
  WalletOpenParams,
  SendParams,
  TransferParams,
  TransactionCursor,
  TransactionPage,
  WalletBalance,
  AccountInfo,
} from '../types'

export function useWallet(): UseWalletReturn {
  const pluginOptions = inject<KaspaPluginOptions>(KASPA_OPTIONS_KEY, {})
  const manager = getWalletManager()
  const { state, balances } = manager

  return {
    walletStatus: readonly(computed(() => state.walletStatus)) as UseWalletReturn['walletStatus'],
    isOpen: computed(() => state.walletStatus === 'open'),
    accounts: readonly(computed(() => state.accounts)) as UseWalletReturn['accounts'],
    activeAccount: readonly(
      computed(() => state.accounts.find((a) => a.id === state.activeAccountId) ?? null),
    ) as UseWalletReturn['activeAccount'],
    isSyncing: readonly(computed(() => state.isSyncing)) as UseWalletReturn['isSyncing'],
    error: readonly(computed(() => state.error)) as UseWalletReturn['error'],

    async create(params: WalletCreateParams): Promise<void> {
      await ensureWasmInit(pluginOptions)
      await manager.create(params)
    },

    async open(params: WalletOpenParams): Promise<void> {
      await ensureWasmInit(pluginOptions)
      await manager.open(params)
    },

    async close(): Promise<void> {
      await manager.close()
    },

    async exists(): Promise<boolean> {
      await ensureWasmInit(pluginOptions)
      return manager.exists()
    },

    async createAccount(name?: string, password?: string): Promise<AccountInfo> {
      return manager.createAccount(name, password)
    },

    setActiveAccount(accountId: string): void {
      state.activeAccountId = accountId
    },

    async send(params: SendParams): Promise<string> {
      return manager.send(params)
    },

    async transfer(params: TransferParams): Promise<string> {
      return manager.transfer(params)
    },

    async getTransactions(
      accountId: string,
      cursor?: TransactionCursor,
    ): Promise<TransactionPage> {
      const result = await manager.getTransactions(accountId, cursor)
      return result as TransactionPage
    },

    getBalance(accountId?: string): UseWalletReturn['getBalance'] extends (id?: string) => infer R ? R : never {
      const id = accountId ?? state.activeAccountId ?? ''
      return computed(() => manager.getBalance(id)) as ReturnType<UseWalletReturn['getBalance']>
    },
  }
}
