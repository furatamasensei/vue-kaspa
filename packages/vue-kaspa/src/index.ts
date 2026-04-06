// Plugin
export { VueKaspa } from './plugin'

// Components
export { default as ConnectWallet } from './components/ConnectWallet.vue'

// Composables
export { useKaspa } from './composables/useKaspa'
export { useRpc } from './composables/useRpc'
export { useUtxo } from './composables/useUtxo'
export { useTransaction } from './composables/useTransaction'
export { useTransactionListener } from './composables/useTransactionListener'
export { useBlockListener } from './composables/useBlockListener'
export { useCrypto } from './composables/useCrypto'
export { useNetwork } from './composables/useNetwork'
export { useWallet } from './composables/useWallet'

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
  VueKaspaOptions,
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
  BlockListenerOptions,
  UseBlockListenerReturn,
  TransactionListenerOptions,
  UseTransactionListenerReturn,
  UseCryptoReturn,
  UseNetworkReturn,
  UseWalletReturn,
  WalletProvider,
  WalletBalance,
  WalletSendOptions,
} from './types'

// Constants
export { AVAILABLE_NETWORKS } from './types'
