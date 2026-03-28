// Plugin
export { KaspaPlugin } from './plugin'

// Composables
export { useKaspa } from './composables/useKaspa'
export { useRpc } from './composables/useRpc'
export { useUtxo } from './composables/useUtxo'
export { useTransaction } from './composables/useTransaction'
export { useCrypto } from './composables/useCrypto'
export { useNetwork } from './composables/useNetwork'

// Error classes
export {
  KaspaError,
  KaspaNotReadyError,
  KaspaRpcError,
  KaspaWalletError,
  KaspaCryptoError,
} from './errors'

// All public types
export type {
  KaspaPluginOptions,
  KaspaNetwork,
  RpcEncoding,
  WasmStatus,
  RpcConnectionState,
  RpcOptions,
  ServerInfo,
  BlockInfo,
  UtxoEntry,
  UtxoBalance,
  MempoolEntry,
  BalanceResult,
  FeeEstimate,
  RpcEventType,
  RpcEvent,
  PaymentOutput,
  TransactionSummary,
  CreateTransactionSettings,
  PendingTx,
  KeypairInfo,
  MnemonicInfo,
  DerivedKey,
  SignMessageResult,
  UseKaspaReturn,
  UseRpcReturn,
  UseUtxoReturn,
  UseTransactionReturn,
  UseCryptoReturn,
  UseNetworkReturn,
} from './types'

// Constants
export { AVAILABLE_NETWORKS } from './types'
