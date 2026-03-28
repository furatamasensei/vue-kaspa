// Plugin
export { KaspaPlugin } from './plugin'

// Composables
export { useKaspa } from './composables/useKaspa'
export { useRpc } from './composables/useRpc'
export { useWallet } from './composables/useWallet'
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
  MempoolEntry,
  BalanceResult,
  FeeEstimate,
  RpcEventType,
  RpcEvent,
  WalletStatus,
  WalletBalance,
  AccountInfo,
  SendParams,
  TransferParams,
  WalletCreateParams,
  WalletOpenParams,
  TransactionCursor,
  TransactionRecord,
  TransactionPage,
  KeypairInfo,
  MnemonicInfo,
  DerivedKey,
  SignMessageResult,
  UseKaspaReturn,
  UseRpcReturn,
  UseWalletReturn,
  UseCryptoReturn,
  UseNetworkReturn,
} from './types'

// Constants
export { AVAILABLE_NETWORKS } from './types'
