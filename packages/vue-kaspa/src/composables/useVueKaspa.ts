import { useKaspa } from './useKaspa'
import { useRpc } from './useRpc'
import { useUtxo } from './useUtxo'
import { useTransaction } from './useTransaction'
import { useCrypto } from './useCrypto'
import { useNetwork } from './useNetwork'
import { useWallet } from './useWallet'
import type { UseVueKaspaReturn } from '../types'

export function useVueKaspa(): UseVueKaspaReturn {
  return {
    kaspa: useKaspa(),
    rpc: useRpc(),
    utxo: useUtxo(),
    transaction: useTransaction(),
    crypto: useCrypto(),
    network: useNetwork(),
    wallet: useWallet(),
  }
}
