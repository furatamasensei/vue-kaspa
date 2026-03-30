import { ref, computed, readonly } from 'vue'
import { KaspaWalletError } from '../errors'
import type { WalletProvider, WalletBalance, WalletSendOptions, UseWalletReturn } from '../types'

// ─── Module-level shared state ─────────────────────────────────────────────

const _provider = ref<WalletProvider | null>(null)
const _address = ref<string | null>(null)
const _publicKey = ref<string | null>(null)
const _balance = ref<WalletBalance | null>(null)
const _network = ref<string | null>(null)
const _isConnecting = ref(false)
const _error = ref<Error | null>(null)

// Cleanup function for active KasWare event listeners
let _removeKaswareListeners: (() => void) | null = null

// ─── Helpers ───────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function getKasware(): any {
  return typeof window !== 'undefined' ? (window as any).kasware : undefined
}

function getKastle(): any {
  return typeof window !== 'undefined' ? (window as any).kastle : undefined
}

function tryOff(obj: any, event: string, handler: (...args: any[]) => void): void {
  if (typeof obj?.off === 'function') obj.off(event, handler)
  else if (typeof obj?.removeListener === 'function') obj.removeListener(event, handler)
}

function clearState(): void {
  _provider.value = null
  _address.value = null
  _publicKey.value = null
  _balance.value = null
  _network.value = null
}

// ─── KasWare ──────────────────────────────────────────────────────────────

async function connectKasware(): Promise<void> {
  const kasware = getKasware()
  if (!kasware) {
    throw new KaspaWalletError('connect', new Error('KasWare wallet extension is not installed'))
  }

  const accounts: string[] = await kasware.requestAccounts()
  if (!accounts?.length) {
    throw new KaspaWalletError('connect', new Error('No accounts returned by KasWare'))
  }

  _address.value = accounts[0]
  _publicKey.value = await kasware.getPublicKey()
  _network.value = await kasware.getNetwork()
  _balance.value = await kasware.getBalance()
  _provider.value = 'kasware'

  const onAccountsChanged = (updated: string[]) => {
    if (!updated?.length) {
      cleanupKaswareListeners()
      clearState()
    } else {
      _address.value = updated[0]
    }
  }
  const onNetworkChanged = (network: string) => {
    _network.value = network
  }
  const onBalanceChanged = (balance: WalletBalance) => {
    _balance.value = balance
  }

  kasware.on('accountsChanged', onAccountsChanged)
  kasware.on('networkChanged', onNetworkChanged)
  kasware.on('balanceChanged', onBalanceChanged)

  _removeKaswareListeners = () => {
    tryOff(kasware, 'accountsChanged', onAccountsChanged)
    tryOff(kasware, 'networkChanged', onNetworkChanged)
    tryOff(kasware, 'balanceChanged', onBalanceChanged)
  }
}

function cleanupKaswareListeners(): void {
  if (_removeKaswareListeners) {
    _removeKaswareListeners()
    _removeKaswareListeners = null
  }
}

// ─── Kastle ───────────────────────────────────────────────────────────────

async function connectKastle(network?: string): Promise<void> {
  const kastle = getKastle()
  if (!kastle) {
    throw new KaspaWalletError('connect', new Error('Kastle wallet extension is not installed'))
  }

  const targetNetwork = network ?? 'mainnet'
  await kastle.connect(targetNetwork)
  const account: { address: string; publicKey: string } = await kastle.getAccount()

  _address.value = account.address
  _publicKey.value = account.publicKey
  _network.value = targetNetwork
  _provider.value = 'kastle'
}

// ─── Composable ───────────────────────────────────────────────────────────

export function useWallet(): UseWalletReturn {
  return {
    provider: readonly(_provider) as UseWalletReturn['provider'],
    address: readonly(_address) as UseWalletReturn['address'],
    publicKey: readonly(_publicKey) as UseWalletReturn['publicKey'],
    balance: readonly(_balance) as UseWalletReturn['balance'],
    network: readonly(_network) as UseWalletReturn['network'],
    isConnecting: readonly(_isConnecting) as UseWalletReturn['isConnecting'],
    isConnected: computed(() => _provider.value !== null && _address.value !== null),
    isKaswareInstalled: computed(() => Boolean(getKasware())),
    isKastleInstalled: computed(() => Boolean(getKastle())),
    error: readonly(_error) as UseWalletReturn['error'],

    async connect(provider: WalletProvider, network?: string): Promise<void> {
      if (_isConnecting.value) return
      _isConnecting.value = true
      _error.value = null
      try {
        if (provider === 'kasware') {
          await connectKasware()
        } else {
          await connectKastle(network)
        }
      } catch (err) {
        _error.value = err instanceof Error ? err : new KaspaWalletError('connect', err)
        throw _error.value
      } finally {
        _isConnecting.value = false
      }
    },

    async disconnect(): Promise<void> {
      try {
        if (_provider.value === 'kasware') {
          cleanupKaswareListeners()
          const kasware = getKasware()
          if (kasware) await kasware.disconnect(window.location.origin)
        }
        // Kastle has no disconnect API
      } catch {
        // Ignore disconnect errors
      } finally {
        clearState()
        _error.value = null
      }
    },

    async sendKaspa(to: string, amount: bigint, options?: WalletSendOptions): Promise<string> {
      if (!_provider.value) {
        throw new KaspaWalletError('sendKaspa', new Error('No wallet connected'))
      }
      try {
        if (_provider.value === 'kasware') {
          const kasware = getKasware()
          if (!kasware) throw new Error('KasWare not available')
          return await kasware.sendKaspa(to, amount, options)
        } else {
          throw new KaspaWalletError(
            'sendKaspa',
            new Error(
              'Kastle requires a pre-built transaction. Use window.kastle.signAndBroadcastTx(network, txJson) directly.',
            ),
          )
        }
      } catch (err) {
        throw err instanceof KaspaWalletError ? err : new KaspaWalletError('sendKaspa', err)
      }
    },

    async signMessage(message: string, options?: { type?: 'schnorr' | 'ecdsa' }): Promise<string> {
      if (!_provider.value) {
        throw new KaspaWalletError('signMessage', new Error('No wallet connected'))
      }
      try {
        if (_provider.value === 'kasware') {
          const kasware = getKasware()
          if (!kasware) throw new Error('KasWare not available')
          return await kasware.signMessage(message, { type: options?.type ?? 'schnorr' })
        } else {
          throw new KaspaWalletError(
            'signMessage',
            new Error('Kastle does not support message signing'),
          )
        }
      } catch (err) {
        throw err instanceof KaspaWalletError ? err : new KaspaWalletError('signMessage', err)
      }
    },
  }
}
