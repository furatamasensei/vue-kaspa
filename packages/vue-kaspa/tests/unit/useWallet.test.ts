import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { Wallet, createWalletMock } from '../mocks/kaspa-wasm'
import { KaspaPlugin } from '../../src/plugin'
import { useWallet } from '../../src/composables/useWallet'
import { resetWalletManager, getWalletManager } from '../../src/internal/wallet-manager'
import { resetWasm } from '../../src/internal/wasm-loader'

function mountUseWallet(pluginOptions = {}) {
  let result: ReturnType<typeof useWallet>
  const TestComponent = defineComponent({
    setup() {
      result = useWallet()
      return () => null
    },
  })
  const wrapper = mount(TestComponent, {
    global: { plugins: [[KaspaPlugin, { autoConnect: false, ...pluginOptions }]] },
    attachTo: document.body,
  })
  return { wrapper, get wallet() { return result } }
}

describe('useWallet', () => {
  beforeEach(() => {
    resetWalletManager()
    resetWasm()
  })

  it('starts in uninitialized state', () => {
    const { wallet } = mountUseWallet()
    expect(wallet.walletStatus.value).toBe('uninitialized')
    expect(wallet.isOpen.value).toBe(false)
    expect(wallet.accounts.value).toHaveLength(0)
    expect(wallet.error.value).toBeNull()
  })

  it('open() transitions to open state', async () => {
    const { wallet } = mountUseWallet()
    await wallet.open({ walletSecret: 'pass123' })
    expect(wallet.walletStatus.value).toBe('open')
    expect(wallet.isOpen.value).toBe(true)
  })

  it('close() transitions back to closed', async () => {
    const { wallet } = mountUseWallet()
    await wallet.open({ walletSecret: 'pass123' })
    await wallet.close()
    expect(wallet.walletStatus.value).toBe('closed')
    expect(wallet.isOpen.value).toBe(false)
    expect(wallet.accounts.value).toHaveLength(0)
  })

  it('exists() delegates to wallet.exists()', async () => {
    const { wallet } = mountUseWallet()
    const result = await wallet.exists()
    expect(result).toBe(true)
  })

  it('create() calls wallet.walletCreate()', async () => {
    const { wallet } = mountUseWallet()
    await wallet.create({ walletSecret: 'pass123' })
    const mockWalletInstance = Wallet.mock.results[0].value
    expect(mockWalletInstance.walletCreate).toHaveBeenCalled()
  })

  it('send() calls wallet.accountsSend() and returns txid', async () => {
    const { wallet } = mountUseWallet()
    await wallet.open({ walletSecret: 'pass123' })
    const txid = await wallet.send({
      accountId: 'acc-1',
      address: 'kaspa:qrdest',
      amount: 1_000_000_000n,
      password: 'pass123',
    })
    expect(txid).toBe('mock-txid')
  })

  it('getBalance() returns a ComputedRef with zero balance initially', () => {
    const { wallet } = mountUseWallet()
    const balance = wallet.getBalance()
    expect(balance.value.mature).toBe(0n)
    expect(balance.value.pending).toBe(0n)
  })

  it('setActiveAccount() updates activeAccount', async () => {
    const { wallet } = mountUseWallet()
    await wallet.open({ walletSecret: 'pass123' })

    const manager = getWalletManager()
    manager.state.accounts = [{
      id: 'test-id',
      name: 'Test',
      receiveAddress: 'kaspa:qr...',
      changeAddress: 'kaspa:qrc...',
      balance: { mature: 0n, pending: 0n, outgoing: 0n },
    }]

    wallet.setActiveAccount('test-id')
    expect(wallet.activeAccount.value?.id).toBe('test-id')
  })

  it('walletStatus becomes error on open() failure', async () => {
    Wallet.mockImplementationOnce(function() {
      const mock = createWalletMock()
      mock.walletOpen = vi.fn().mockRejectedValueOnce(new Error('wrong password'))
      return mock
    })
    const { wallet } = mountUseWallet()
    await expect(wallet.open({ walletSecret: 'wrong' })).rejects.toThrow()
    expect(wallet.walletStatus.value).toBe('error')
  })
})
