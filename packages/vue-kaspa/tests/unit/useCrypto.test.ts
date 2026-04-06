import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { VueKaspa } from '../../src/plugin'
import { useCrypto } from '../../src/composables/useCrypto'
import { useNetwork, getCurrentNetworkRef } from '../../src/composables/useNetwork'
import { resetWasm } from '../../src/internal/wasm-loader'
import { loadKaspa } from '../../src/internal/kaspa'

function mountUseCrypto(pluginOptions = {}) {
  let result: ReturnType<typeof useCrypto>
  const TestComponent = defineComponent({
    setup() {
      result = useCrypto()
      return () => null
    },
  })
  const wrapper = mount(TestComponent, {
    global: { plugins: [[VueKaspa, { autoConnect: false, ...pluginOptions }]] },
    attachTo: document.body,
  })
  return { wrapper, get crypto() { return result } }
}

function mountUseCryptoAndNetwork(pluginOptions = {}) {
  let cryptoResult: ReturnType<typeof useCrypto>
  let networkResult: ReturnType<typeof useNetwork>
  const TestComponent = defineComponent({
    setup() {
      cryptoResult = useCrypto()
      networkResult = useNetwork()
      return () => null
    },
  })
  const wrapper = mount(TestComponent, {
    global: { plugins: [[VueKaspa, { autoConnect: false, ...pluginOptions }]] },
    attachTo: document.body,
  })
  return {
    wrapper,
    get crypto() {
      return cryptoResult
    },
    get network() {
      return networkResult
    },
  }
}

describe('useCrypto', () => {
  beforeEach(async () => {
    resetWasm()
    await loadKaspa()
    getCurrentNetworkRef().value = 'mainnet'
  })

  describe('unit conversions (pure, no WASM needed)', () => {
    it('kaspaToSompi converts KAS string to sompi bigint', () => {
      const { crypto } = mountUseCrypto()
      expect(crypto.kaspaToSompi('1')).toBe(1_000_000_000n)
      expect(crypto.kaspaToSompi('0.5')).toBe(500_000_000n)
      expect(crypto.kaspaToSompi(2)).toBe(2_000_000_000n)
    })

    it('sompiToKaspa converts sompi bigint to KAS string', () => {
      const { crypto } = mountUseCrypto()
      expect(crypto.sompiToKaspa(1_000_000_000n)).toContain('1')
      expect(crypto.sompiToKaspa(500_000_000n)).toContain('0.5')
    })

    it('sompiToKaspaString returns formatted string', () => {
      const { crypto } = mountUseCrypto()
      const result = crypto.sompiToKaspaString(1_000_000_000n)
      expect(result).toContain('1')
    })

    it('currencyUnit defaults to KAS on mainnet', () => {
      const { crypto } = mountUseCrypto({ network: 'mainnet' })

      expect(crypto.currencyUnit()).toBe('KAS')
      expect(crypto.numberToKaspa(1_500_000_000n)).toContain('KAS')
    })

    it('currencyUnit switches to TKAS on testnet', () => {
      const { crypto } = mountUseCrypto({ network: 'testnet-10' })

      expect(crypto.currencyUnit()).toBe('TKAS')
      expect(crypto.numberToKaspa(1_500_000_000n)).toContain('TKAS')
    })

    it('network-aware helpers follow the active network', async () => {
      const { crypto, network } = mountUseCryptoAndNetwork({ network: 'testnet-10' })

      expect(crypto.currencyUnit()).toBe('TKAS')
      expect(crypto.numberToKaspa(1_000_000_000n)).toContain('TKAS')
      expect(crypto.numberToSompi('1.5')).toBe(1_500_000_000n)

      await network.switchNetwork('mainnet')

      expect(crypto.currencyUnit()).toBe('KAS')
      expect(crypto.numberToKaspa(1_000_000_000n)).toContain('KAS')
    })
  })

  describe('key generation', () => {
    it('generateMnemonic() returns 24-word phrase by default', () => {
      const { crypto } = mountUseCrypto()
      const mnemonic = crypto.generateMnemonic()
      expect(mnemonic.phrase).toBeTruthy()
      expect(mnemonic.wordCount).toBe(24)
    })

    it('generateMnemonic(12) returns 12-word phrase', () => {
      const { crypto } = mountUseCrypto()
      const mnemonic = crypto.generateMnemonic(12)
      expect(mnemonic.wordCount).toBe(12)
    })

    it('generateKeypair() returns keypair with address', () => {
      const { crypto } = mountUseCrypto()
      const keypair = crypto.generateKeypair('mainnet')
      expect(keypair.privateKeyHex).toBeTruthy()
      expect(keypair.publicKeyHex).toBeTruthy()
      expect(keypair.address).toContain('kaspa:')
    })

    it('mnemonicToKeypair() derives keypair from mnemonic', () => {
      const { crypto } = mountUseCrypto()
      const keypair = crypto.mnemonicToKeypair(
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        'mainnet',
      )
      expect(keypair.address).toContain('kaspa:')
    })
  })

  describe('address utilities', () => {
    it('createAddress() converts pubkey hex to address', () => {
      const { crypto } = mountUseCrypto()
      const address = crypto.createAddress('mock-pubkey', 'mainnet')
      expect(address).toContain('kaspa:')
    })

    it('isValidAddress() returns true for valid address', () => {
      const { crypto } = mountUseCrypto()
      // The mock Address.validate returns true for 'kaspa:' prefixed addresses
      expect(crypto.isValidAddress('kaspa:qrmockaddress')).toBe(true)
    })

    it('isValidAddress() returns false for empty string', () => {
      const { crypto } = mountUseCrypto()
      expect(crypto.isValidAddress('')).toBe(false)
    })
  })

  describe('message signing', () => {
    it('signMessage() returns signature string', () => {
      const { crypto } = mountUseCrypto()
      const sig = crypto.signMessage('hello', 'mock-private-key')
      expect(sig).toBe('mock-signature-hex')
    })

    it('verifyMessage() returns boolean', () => {
      const { crypto } = mountUseCrypto()
      const valid = crypto.verifyMessage('hello', 'mock-sig', 'mock-pubkey')
      expect(valid).toBe(true)
    })
  })

  describe('HD derivation', () => {
    it('derivePublicKeys() returns receive and change key arrays', () => {
      const { crypto } = mountUseCrypto()
      const result = crypto.derivePublicKeys(
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        'mainnet',
        5,
        5,
      )
      expect(result.receive).toHaveLength(5)
      expect(result.change).toHaveLength(5)
      expect(result.receive[0]).toHaveProperty('address')
    })
  })
})
