import { getKaspa } from '../internal/kaspa'
import type { KaspaNetwork, UseCryptoReturn, KeypairInfo, MnemonicInfo, DerivedKey } from '../types'
import { KaspaCryptoError } from '../errors'
import { useNetwork } from './useNetwork'

export function useCrypto(): UseCryptoReturn {
  const network = useNetwork()

  function resolveNetwork(networkOverride?: KaspaNetwork): KaspaNetwork {
    return networkOverride ?? network.currentNetwork.value
  }

  function resolveUnit(networkOverride?: KaspaNetwork): 'KAS' | 'TKAS' {
    return resolveNetwork(networkOverride) === 'mainnet' ? 'KAS' : 'TKAS'
  }

  return {
    generateMnemonic(wordCount: 12 | 24 = 24): MnemonicInfo {
      try {
        const { Mnemonic } = getKaspa()
        const mnemonic = Mnemonic.random(wordCount)
        return { phrase: mnemonic.phrase, wordCount }
      } catch (err) {
        throw new KaspaCryptoError('generateMnemonic', err)
      }
    },

    mnemonicToKeypair(phrase: string, network: KaspaNetwork): KeypairInfo {
      try {
        const { Mnemonic, PrivateKey } = getKaspa()
        const m = new Mnemonic(phrase)
        // toSeed() returns a hex string in v1.1.0
        const seedHex = m.toSeed()
        const privateKeyHex = seedHex.slice(0, 64) // first 32 bytes
        const privKey = new PrivateKey(privateKeyHex)
        const keypair = privKey.toKeypair()
        const address = keypair.toAddress(network)
        return {
          privateKeyHex,
          publicKeyHex: keypair.publicKey as string,
          address: address.toString(),
        }
      } catch (err) {
        throw new KaspaCryptoError('mnemonicToKeypair', err)
      }
    },

    generateKeypair(network: KaspaNetwork): KeypairInfo {
      try {
        const { Mnemonic, PrivateKey } = getKaspa()
        const mnemonic = Mnemonic.random(24)
        const seedHex = mnemonic.toSeed()
        const privateKeyHex = seedHex.slice(0, 64)
        const privKey = new PrivateKey(privateKeyHex)
        const keypair = privKey.toKeypair()
        const address = keypair.toAddress(network)
        return {
          privateKeyHex,
          publicKeyHex: keypair.publicKey as string,
          address: address.toString(),
        }
      } catch (err) {
        throw new KaspaCryptoError('generateKeypair', err)
      }
    },

    derivePublicKeys(
      phrase: string,
      network: KaspaNetwork,
      receiveCount = 10,
      changeCount = 10,
    ): { receive: DerivedKey[]; change: DerivedKey[] } {
      try {
        const { Mnemonic, XPrv, PrivateKeyGenerator } = getKaspa()
        const m = new Mnemonic(phrase)
        const seedHex = m.toSeed()
        const xprv = new XPrv(seedHex)
        const generator = new PrivateKeyGenerator(xprv, false, 0n)

        const receive: DerivedKey[] = Array.from({ length: receiveCount }, (_, i) => {
          const privKey = generator.receiveKey(i)
          const address = privKey.toAddress(network)
          return { index: i, publicKeyHex: privKey.toPublicKey().toString(), address: address.toString() }
        })
        const change: DerivedKey[] = Array.from({ length: changeCount }, (_, i) => {
          const privKey = generator.changeKey(i)
          const address = privKey.toAddress(network)
          return { index: i, publicKeyHex: privKey.toPublicKey().toString(), address: address.toString() }
        })
        return { receive, change }
      } catch (err) {
        throw new KaspaCryptoError('derivePublicKeys', err)
      }
    },

    createAddress(publicKeyHex: string, network: KaspaNetwork): string {
      try {
        const { createAddress } = getKaspa()
        const addr = createAddress(publicKeyHex, network)
        return addr.toString()
      } catch (err) {
        throw new KaspaCryptoError('createAddress', err)
      }
    },

    isValidAddress(address: string): boolean {
      if (!address) return false
      const { Address } = getKaspa()
      return Address.validate(address)
    },

    signMessage(message: string, privateKeyHex: string): string {
      try {
        const { signMessage: sdkSignMessage } = getKaspa()
        return sdkSignMessage({ message, privateKey: privateKeyHex })
      } catch (err) {
        throw new KaspaCryptoError('signMessage', err)
      }
    },

    verifyMessage(message: string, signature: string, publicKeyHex: string): boolean {
      try {
        const { verifyMessage: sdkVerifyMessage } = getKaspa()
        return sdkVerifyMessage({ message, signature, publicKey: publicKeyHex })
      } catch (err) {
        throw new KaspaCryptoError('verifyMessage', err)
      }
    },

    kaspaToSompi(kas: string | number): bigint {
      const { kaspaToSompi: sdkKaspaToSompi } = getKaspa()
      const result = sdkKaspaToSompi(String(kas))
      return result ?? 0n
    },

    sompiToKaspa(sompi: bigint): string {
      const { sompiToKaspaString: sdkSompiToKaspaString } = getKaspa()
      return sdkSompiToKaspaString(sompi)
    },

    sompiToKaspaString(sompi: bigint, decimals = 8): string {
      const { sompiToKaspaString: sdkSompiToKaspaString } = getKaspa()
      const str = sdkSompiToKaspaString(sompi)
      if (decimals < 8) {
        const parts = str.split('.')
        if (parts[1]) {
          return `${parts[0]}.${parts[1].slice(0, decimals)}`
        }
      }
      return str
    },

    currencyUnit(networkOverride?: KaspaNetwork): 'KAS' | 'TKAS' {
      return resolveUnit(networkOverride)
    },

    numberToKaspa(sompi: bigint | number, networkOverride?: KaspaNetwork): string {
      const { sompiToKaspaStringWithSuffix } = getKaspa()
      return sompiToKaspaStringWithSuffix(sompi, resolveNetwork(networkOverride))
    },

    numberToSompi(kas: string | number): bigint {
      const { kaspaToSompi: sdkKaspaToSompi } = getKaspa()
      const result = sdkKaspaToSompi(String(kas))
      return result ?? 0n
    },
  }
}
