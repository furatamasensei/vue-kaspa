import { shallowReactive, ref } from 'vue'
import type { WalletStatus, AccountInfo, WalletBalance } from '../types'
import { KaspaWalletError } from '../errors'

type AnyWallet = {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  start: () => Promise<void>
  stop: () => Promise<void>
  addEventListener: (cb: (event: { type: string; data: unknown }) => void) => void
  removeEventListener: (cb: (event: { type: string; data: unknown }) => void) => void
  exists: (filename?: string) => Promise<boolean>
  walletCreate: (params: unknown) => Promise<unknown>
  walletOpen: (params: unknown) => Promise<unknown>
  walletClose: () => Promise<void>
  accountsEnumerate: (params: unknown) => Promise<{ accountDescriptors: RawAccountDescriptor[] }>
  accountsActivate: (params: unknown) => Promise<void>
  accountsCreate: (params: unknown) => Promise<{ accountDescriptor: RawAccountDescriptor }>
  accountsEnsureDefault: (params: unknown) => Promise<{ accountDescriptor: RawAccountDescriptor }>
  accountsSend: (params: unknown) => Promise<{ generatorSummary: { finalTransactionId?: string } }>
  accountsTransfer: (params: unknown) => Promise<{ generatorSummary: unknown }>
  transactionsDataGet: (params: unknown) => Promise<{ transactions: unknown[]; total: number }>
}

interface RawAccountDescriptor {
  accountId: string
  accountName?: string
  receiveAddress: { toString(): string }
  changeAddress: { toString(): string }
}

export interface WalletManagerState {
  walletStatus: WalletStatus
  accounts: AccountInfo[]
  activeAccountId: string | null
  isSyncing: boolean
  error: Error | null
}

function emptyBalance(): WalletBalance {
  return { mature: 0n, pending: 0n, outgoing: 0n }
}

function mapDescriptor(desc: RawAccountDescriptor): AccountInfo {
  return {
    id: desc.accountId,
    name: desc.accountName ?? 'Account',
    receiveAddress: desc.receiveAddress.toString(),
    changeAddress: desc.changeAddress.toString(),
    balance: emptyBalance(),
  }
}

export class WalletManager {
  readonly state = shallowReactive<WalletManagerState>({
    walletStatus: 'uninitialized',
    accounts: [],
    activeAccountId: null,
    isSyncing: false,
    error: null,
  })

  readonly balances = ref<Map<string, WalletBalance>>(new Map())
  private wallet: AnyWallet | null = null
  private eventListener: ((event: { type: string; data: unknown }) => void) | null = null

  getWallet(): AnyWallet | null {
    return this.wallet
  }

  async init(): Promise<void> {
    if (this.wallet) return
    const { Wallet } = await import('kaspa-wasm')
    this.wallet = new Wallet({ resident: false }) as AnyWallet
    this.attachEventListener()
    this.state.walletStatus = 'closed'
  }

  private attachEventListener(): void {
    if (!this.wallet) return
    this.eventListener = ({ type, data }) => {
      this.handleWalletEvent(type, data)
    }
    this.wallet.addEventListener(this.eventListener)
  }

  private handleWalletEvent(type: string, data: unknown): void {
    if (type === 'balance') {
      const ev = data as { id: string; balance?: { mature: bigint; pending: bigint; outgoing: bigint } }
      if (ev.id && ev.balance) {
        const newMap = new Map(this.balances.value)
        newMap.set(ev.id, {
          mature: ev.balance.mature,
          pending: ev.balance.pending,
          outgoing: ev.balance.outgoing,
        })
        this.balances.value = newMap
        // Update accounts array
        this.state.accounts = this.state.accounts.map((a) =>
          a.id === ev.id ? { ...a, balance: newMap.get(ev.id)! } : a,
        )
      }
    } else if (type === 'sync-state') {
      const ev = data as { event?: { type: string } }
      this.state.isSyncing = ev.event?.type !== 'done'
    }
  }

  async create(params: { walletSecret: string; walletName?: string }): Promise<void> {
    await this.init()
    try {
      await this.wallet!.walletCreate({
        walletSecret: params.walletSecret,
        filename: params.walletName ?? 'wallet',
        title: params.walletName ?? 'My Wallet',
      })
      this.state.walletStatus = 'closed'
    } catch (err) {
      throw new KaspaWalletError('create', err)
    }
  }

  async open(params: { walletSecret: string }): Promise<void> {
    await this.init()
    this.state.walletStatus = 'opening'
    try {
      await this.wallet!.walletOpen({ walletSecret: params.walletSecret, filename: 'wallet' })
      await this.wallet!.start()

      const { accountDescriptors } = await this.wallet!.accountsEnumerate({})
      this.state.accounts = accountDescriptors.map(mapDescriptor)

      if (this.state.accounts.length > 0) {
        this.state.activeAccountId = this.state.accounts[0].id
        await this.wallet!.accountsActivate({ accountIds: [this.state.accounts[0].id] })
      }

      this.state.walletStatus = 'open'
    } catch (err) {
      this.state.walletStatus = 'error'
      this.state.error = err instanceof Error ? err : new Error(String(err))
      throw new KaspaWalletError('open', err)
    }
  }

  async close(): Promise<void> {
    if (!this.wallet) return
    try {
      await this.wallet.stop()
      await this.wallet.walletClose()
    } catch {
      // Ignore close errors
    }
    this.state.walletStatus = 'closed'
    this.state.accounts = []
    this.state.activeAccountId = null
    this.balances.value = new Map()
  }

  async exists(): Promise<boolean> {
    await this.init()
    return this.wallet!.exists()
  }

  async createAccount(name?: string, password?: string): Promise<AccountInfo> {
    if (!this.wallet || this.state.walletStatus !== 'open') {
      throw new KaspaWalletError('createAccount', 'Wallet not open')
    }
    try {
      const { accountDescriptor } = await this.wallet.accountsCreate({
        walletSecret: password ?? '',
        type: 'bip32',
        accountName: name ?? 'Account',
        prvKeyDataId: undefined,
      })
      const account = mapDescriptor(accountDescriptor)
      this.state.accounts = [...this.state.accounts, account]
      return account
    } catch (err) {
      throw new KaspaWalletError('createAccount', err)
    }
  }

  async send(params: {
    accountId: string
    address: string
    amount: bigint
    priorityFee?: bigint
    password: string
  }): Promise<string> {
    if (!this.wallet) throw new KaspaWalletError('send', 'Wallet not initialized')
    try {
      const result = await this.wallet.accountsSend({
        walletSecret: params.password,
        accountId: params.accountId,
        priorityFeeSompi: params.priorityFee ?? 0n,
        destination: [{ address: params.address, amount: params.amount }],
      })
      return result.generatorSummary.finalTransactionId ?? ''
    } catch (err) {
      throw new KaspaWalletError('send', err)
    }
  }

  async transfer(params: {
    fromAccountId: string
    toAccountId: string
    amount: bigint
    priorityFee?: bigint
    password: string
  }): Promise<string> {
    if (!this.wallet) throw new KaspaWalletError('transfer', 'Wallet not initialized')
    try {
      const result = await this.wallet.accountsTransfer({
        walletSecret: params.password,
        sourceAccountId: params.fromAccountId,
        destinationAccountId: params.toAccountId,
        transferAmountSompi: params.amount,
        priorityFeeSompi: params.priorityFee ?? 0n,
      })
      const summary = result.generatorSummary as { finalTransactionId?: string }
      return summary.finalTransactionId ?? ''
    } catch (err) {
      throw new KaspaWalletError('transfer', err)
    }
  }

  async getTransactions(
    accountId: string,
    cursor = { start: 0, end: 20 },
  ): Promise<{ transactions: unknown[]; total: number }> {
    if (!this.wallet) throw new KaspaWalletError('getTransactions', 'Wallet not initialized')
    return this.wallet.transactionsDataGet({ accountId, start: cursor.start, end: cursor.end })
  }

  getBalance(accountId: string): WalletBalance {
    return this.balances.value.get(accountId) ?? emptyBalance()
  }
}

let managerInstance: WalletManager | null = null

export function getWalletManager(): WalletManager {
  if (!managerInstance) {
    managerInstance = new WalletManager()
  }
  return managerInstance
}

export function resetWalletManager(): void {
  managerInstance = null
}
