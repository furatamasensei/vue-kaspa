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
export { useKaspaRest } from './composables/useKaspaRest'
export { useCrypto } from './composables/useCrypto'
export { useNetwork } from './composables/useNetwork'
export { useWallet } from './composables/useWallet'
export { useVueKaspa } from './composables/useVueKaspa'
export { formatHash } from './utils/hash'

// Error classes
export {
  KaspaError,
  KaspaNotReadyError,
  KaspaRpcError,
  KaspaRestError,
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
  KaspaRestOptions,
  KaspaRestRequestOptions,
  KaspaRestResolvePreviousOutpoints,
  KaspaRestSubmitTxScriptPublicKey,
  KaspaRestSubmitTxOutpoint,
  KaspaRestSubmitTxInput,
  KaspaRestSubmitTxOutput,
  KaspaRestSubmitTxModel,
  KaspaRestSubmitTransactionRequest,
  KaspaRestTransaction,
  KaspaRestTransactionAcceptance,
  KaspaRestTransactionCount,
  KaspaRestTxSearchAcceptingBlueScores,
  KaspaRestTxSearch,
  KaspaRestTxMass,
  KaspaRestUtxoResponse,
  KaspaRestUtxoCountResponse,
  KaspaRestBalanceResponse,
  KaspaRestAddressBalanceHistory,
  KaspaRestAddressName,
  KaspaRestDistributionTier,
  KaspaRestDistributionTiers,
  KaspaRestTopAddress,
  KaspaRestTopAddresses,
  KaspaRestAddressesActiveResponse,
  KaspaRestAddressesActiveCountResponse,
  KaspaRestBalancesByAddressEntry,
  KaspaRestBalanceEntry,
  KaspaRestSubmitTransactionResponse,
  KaspaRestParentHash,
  KaspaRestBlockHeader,
  KaspaRestVerboseData,
  KaspaRestBlockTxInputPreviousOutpoint,
  KaspaRestBlockTxInput,
  KaspaRestBlockTxOutputScriptPublicKey,
  KaspaRestBlockTxOutputVerboseData,
  KaspaRestBlockTxOutput,
  KaspaRestBlockTxVerboseData,
  KaspaRestBlockTx,
  KaspaRestBlock,
  KaspaRestBlockResponse,
  KaspaRestBlueScoreResponse,
  KaspaRestBlockdagResponse,
  KaspaRestCoinSupplyResponse,
  KaspaRestBlockRewardResponse,
  KaspaRestHalvingResponse,
  KaspaRestHashrateResponse,
  KaspaRestMaxHashrateResponse,
  KaspaRestHashrateHistoryResponse,
  KaspaRestDBCheckStatus,
  KaspaRestKaspadResponse,
  KaspaRestHealthResponse,
  KaspaRestKaspadInfoResponse,
  KaspaRestPriceResponse,
  KaspaRestMarketCapResponse,
  KaspaRestTransactionCountResponse,
  KaspaRestVcTxInput,
  KaspaRestVcTxOutput,
  KaspaRestVcTx,
  KaspaRestVcBlock,
  KaspaRestReturn,
  RpcEventType,
  RpcEvent,
  BlockDagInfo,
  ConnectedPeerInfo,
  PeerAddress,
  VirtualChainResult,
  PaymentOutput,
  TransactionSummary,
  CreateTransactionSettings,
  PendingTx,
  AcceptedTransactionInfo,
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
  UseKaspaRestReturn,
  UseCryptoReturn,
  UseNetworkReturn,
  UseWalletReturn,
  UseVueKaspaReturn,
  WalletProvider,
  WalletBalance,
  WalletSendOptions,
} from './types'

export type { KaspaHashType, FormatHashOptions } from './utils/hash'

// Constants
export { AVAILABLE_NETWORKS } from './types'
