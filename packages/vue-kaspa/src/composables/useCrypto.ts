import {
  kaspaToSompi as sdkKaspaToSompi,
  sompiToKaspaString as sdkSompiToKaspaString,
  PrivateKey,
  Mnemonic,
  createAddress,
  Address,
  signMessage as sdkSignMessage,
  verifyMessage as sdkVerifyMessage,
} from 'kaspa-wasm'
import type { KaspaNetwork, UseCryptoReturn, KeypairInfo, MnemonicInfo, DerivedKey } from '../types'
import { KaspaCryptoError } from '../errors'

export function useCrypto(): UseCryptoReturn {
  return {
    generateMnemonic(wordCount: 12 | 24 = 24): MnemonicInfo {
      try {
        const mnemonic = Mnemonic.random(wordCount)
        return { phrase: mnemonic.phrase, wordCount }
      } catch (err) {
        throw new KaspaCryptoError('generateMnemonic', err)
      }
    },

    mnemonicToKeypair(phrase: string, network: KaspaNetwork): KeypairInfo {
      try {
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
        const mnemonic = Mnemonic.random(24)
        return useCrypto().mnemonicToKeypair(mnemonic.phrase, network)
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
        // Simplified derivation — production use should use XPrv/PublicKeyGenerator
        const m = new Mnemonic(phrase)
        const seedHex = m.toSeed()
        const basePrivKeyHex = seedHex.slice(0, 64)

        const receive: DerivedKey[] = Array.from({ length: receiveCount }, (_, i) => {
          const pubKey = new PrivateKey(basePrivKeyHex).toPublicKey()
          const address = pubKey.toAddress(network)
          return { index: i, publicKeyHex: pubKey.toString(), address: address.toString() }
        })
        const change: DerivedKey[] = Array.from({ length: changeCount }, (_, i) => {
          const pubKey = new PrivateKey(basePrivKeyHex).toPublicKey()
          const address = pubKey.toAddress(network)
          return { index: i, publicKeyHex: pubKey.toString(), address: address.toString() }
        })
        return { receive, change }
      } catch (err) {
        throw new KaspaCryptoError('derivePublicKeys', err)
      }
    },

    createAddress(publicKeyHex: string, network: KaspaNetwork): string {
      try {
        const addr = createAddress(publicKeyHex, network)
        return addr.toString()
      } catch (err) {
        throw new KaspaCryptoError('createAddress', err)
      }
    },

    isValidAddress(address: string): boolean {
      if (!address) return false
      return Address.validate(address)
    },

    signMessage(message: string, privateKeyHex: string): string {
      try {
        return sdkSignMessage({ message, privateKey: privateKeyHex })
      } catch (err) {
        throw new KaspaCryptoError('signMessage', err)
      }
    },

    verifyMessage(message: string, signature: string, publicKeyHex: string): boolean {
      try {
        return sdkVerifyMessage({ message, signature, publicKey: publicKeyHex })
      } catch (err) {
        throw new KaspaCryptoError('verifyMessage', err)
      }
    },

    kaspaToSompi(kas: string | number): bigint {
      const result = sdkKaspaToSompi(String(kas))
      return result ?? 0n
    },

    sompiToKaspa(sompi: bigint): string {
      return sdkSompiToKaspaString(sompi)
    },

    sompiToKaspaString(sompi: bigint, decimals = 8): string {
      const str = sdkSompiToKaspaString(sompi)
      if (decimals < 8) {
        const parts = str.split('.')
        if (parts[1]) {
          return `${parts[0]}.${parts[1].slice(0, decimals)}`
        }
      }
      return str
    },
  }
}
