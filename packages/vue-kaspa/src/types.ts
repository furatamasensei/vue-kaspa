import type { ComputedRef, Ref } from 'vue'

// ─── Plugin Options ────────────────────────────────────────────────────────

export interface VueKaspaOptions {
  /** Network to connect to. Default: 'mainnet' */
  network?: KaspaNetwork
  /** RPC endpoint URL (e.g. 'ws://127.0.0.1:17110'). Mutually exclusive with resolver. */
  url?: string
  /** REST endpoint URL for the official Kaspa REST API. Default: 'https://api.kaspa.org' */
  restUrl?: string
  /** Use public node resolver. Default: true when url is not provided */
  resolver?: boolean
  /** Wire encoding format. Default: 'Borsh' */
  encoding?: RpcEncoding
  /** Automatically connect RPC on plugin install. Default: true */
  autoConnect?: boolean
  /** Install Vue DevTools integration. Default: true in dev */
  devtools?: boolean
  /** Panic hook after WASM init. Default: 'console' */
  panicHook?: 'console' | 'browser' | false
}

// ─── Network ───────────────────────────────────────────────────────────────

export type KaspaNetwork = 'mainnet' | 'testnet-10' | 'testnet-12' | 'simnet' | 'devnet'

export type RpcEncoding = 'Borsh' | 'SerdeJson'

export const AVAILABLE_NETWORKS: readonly KaspaNetwork[] = [
  'mainnet',
  'testnet-10',
  'testnet-12',
  'simnet',
  'devnet',
] as const

// ─── WASM ──────────────────────────────────────────────────────────────────

export type WasmStatus = 'idle' | 'loading' | 'ready' | 'error'

// ─── RPC ───────────────────────────────────────────────────────────────────

export type RpcConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'

export interface RpcOptions {
  url?: string
  resolver?: boolean
  network?: KaspaNetwork
  encoding?: RpcEncoding
}

export interface ServerInfo {
  isUtxoIndexEnabled: boolean
  isSynced: boolean
  hasNotifyCommand: boolean
  hasMessageId: boolean
  serverVersion: string
  networkId: string
}

export interface BlockInfo {
  hash: string
  timestamp: number
  blueScore: bigint
  transactions: string[]
}

export interface BlockDagInfo {
  networkName: string
  blockCount: bigint
  headerCount: bigint
  tipHashes: string[]
  difficulty: number
  pastMedianTime: bigint
  virtualParentHashes: string[]
  pruningPointHash: string
  virtualDaaScore: bigint
}

export interface ConnectedPeerInfo {
  id: string
  address: string
  isIbdPeer: boolean
  lastPingDuration: bigint
  lastPingTime: bigint
  timeOffset: bigint
  userAgent: string
  advertisedProtocolVersion: number
  timeConnected: bigint
  isOutbound: boolean
}

export interface PeerAddress {
  addr: string
  timestamp: bigint
}

export interface VirtualChainResult {
  removedChainBlockHashes: string[]
  addedChainBlockHashes: string[]
  acceptedTransactionIds?: Array<{
    acceptingBlockHash: string
    acceptedTransactionIds: string[]
  }>
}

export interface GetBlocksOptions {
  /** Only return blocks with blue score higher than this block's */
  lowHash?: string
  /** Include full block data (default: true) */
  includeBlocks?: boolean
  /** Include transaction data inside blocks (default: false) */
  includeTransactions?: boolean
}

/** Flat UTXO entry — matches kaspa-wasm IUtxoEntry; safe to pass directly to createTransactions() */
export interface UtxoEntry {
  address?: string
  outpoint: { transactionId: string; index: number }
  amount: bigint
  scriptPublicKey: { version: number; script: string }
  blockDaaScore: bigint
  isCoinbase: boolean
}

export interface MempoolEntry {
  fee: bigint
  isOrphan: boolean
  transaction: {
    id: string
    inputs: unknown[]
    outputs: unknown[]
  }
}

export interface BalanceResult {
  address: string
  balance: bigint
}

export interface FeeEstimate {
  priorityBucket: { feerate: number; estimatedSeconds: number }
  normalBuckets: Array<{ feerate: number; estimatedSeconds: number }>
  lowBuckets: Array<{ feerate: number; estimatedSeconds: number }>
}

// ─── REST API ──────────────────────────────────────────────────────────────

export type KaspaRestResolvePreviousOutpoints = 'no' | 'light' | 'full'

export interface KaspaRestOptions {
  /** Official REST API base URL. Default: https://api.kaspa.org */
  baseUrl?: string
  /** Shared cache TTL in milliseconds. Default: 30s */
  staleTime?: number
  /** Cache retention in milliseconds. Default: 5m */
  cacheTime?: number
  /** Optional request headers for authenticated/self-hosted setups */
  headers?: HeadersInit
  /** Optional fetch implementation */
  fetcher?: typeof fetch
}

export interface KaspaRestRequestOptions {
  /** Bypass the cache and force a network request */
  forceRefresh?: boolean
  /** Override the default staleTime for this call */
  staleTime?: number
  /** Disable caching for this call */
  cache?: boolean
}

export interface KaspaRestTxScriptPublicKey {
  version?: number
  script?: string
}

export interface KaspaRestTxPreviousOutpoint {
  address?: string
  amount?: bigint
  scriptPublicKey?: KaspaRestTxScriptPublicKey
}

export interface KaspaRestTxInput {
  address?: string
  amount?: bigint
  scriptPublicKey?: KaspaRestTxScriptPublicKey
  previousOutpoint?: KaspaRestTxPreviousOutpoint
  utxo?: KaspaRestTxPreviousOutpoint
}

export interface KaspaRestTransaction {
  id?: string
  transactionId?: string
  hash?: string
  inputs?: KaspaRestTxInput[]
  outputs?: unknown[]
  senderAddresses?: string[]
  [key: string]: unknown
}

export interface KaspaRestTransactionAcceptance {
  transactionId: string
  accepted?: boolean
  acceptingBlockHash?: string
  acceptingBlueScore?: bigint | number
  acceptingTimestamp?: bigint | number
}

export interface KaspaRestSubmitTransactionResponse {
  transactionId?: string
  [key: string]: unknown
}

export interface KaspaRestBalanceEntry {
  address: string
  balance: bigint
}

export interface KaspaRestReturn {
  baseUrl: Readonly<Ref<string>>
  cacheSize: ComputedRef<number>
  clearCache(prefix?: string): void
  request<T = unknown>(
    method: 'GET' | 'POST',
    path: string,
    options?: {
      query?: Record<string, string | number | boolean | bigint | undefined | null>
      body?: unknown
      cacheKey?: string
    } & KaspaRestRequestOptions,
  ): Promise<T>
  getBlock(hash: string, includeTransactions?: boolean): Promise<unknown>
  getBlocks(options?: { lowHash?: string; includeBlocks?: boolean; includeTransactions?: boolean }): Promise<unknown>
  getBlocksFromBlueScore(options: { blueScore?: number; blueScoreGte?: number; blueScoreLt?: number; includeTransactions?: boolean }): Promise<unknown>
  getUtxosByAddress(address: string, options?: KaspaRestRequestOptions): Promise<UtxoEntry[]>
  getUtxosByAddresses(addresses: string[], options?: KaspaRestRequestOptions): Promise<UtxoEntry[]>
  getUtxoCountByAddress(address: string, options?: KaspaRestRequestOptions): Promise<unknown>
  getTransaction(transactionId: string, options?: { resolvePreviousOutpoints?: KaspaRestResolvePreviousOutpoints; acceptance?: string } & KaspaRestRequestOptions): Promise<KaspaRestTransaction | null>
  searchTransactions(
    request: Record<string, unknown>,
    options?: { resolvePreviousOutpoints?: KaspaRestResolvePreviousOutpoints; acceptance?: string } & KaspaRestRequestOptions,
  ): Promise<KaspaRestTransaction[]>
  getTransactionAcceptance(transactionIds: string[], options?: KaspaRestRequestOptions): Promise<KaspaRestTransactionAcceptance[]>
  getFullTransactionsByAddress(
    address: string,
    options?: { limit?: number; offset?: number; fields?: string; resolvePreviousOutpoints?: KaspaRestResolvePreviousOutpoints; acceptance?: string } & KaspaRestRequestOptions,
  ): Promise<KaspaRestTransaction[]>
  getFullTransactionsByAddressPage(
    address: string,
    options?: { limit?: number; before?: number; after?: number; fields?: string; resolvePreviousOutpoints?: KaspaRestResolvePreviousOutpoints; acceptance?: string } & KaspaRestRequestOptions,
  ): Promise<KaspaRestTransaction[]>
  getAddressTransactionCount(address: string, options?: KaspaRestRequestOptions): Promise<unknown>
  getAddressesActiveCount(options?: KaspaRestRequestOptions): Promise<unknown>
  getAddressesActiveCountFor(dayOrMonth: string, options?: KaspaRestRequestOptions): Promise<unknown>
  getBalancesByAddresses(addresses: string[], options?: KaspaRestRequestOptions): Promise<KaspaRestBalanceEntry[]>
  getBlockReward(options?: { stringOnly?: boolean } & KaspaRestRequestOptions): Promise<unknown>
  getHalving(field?: string, options?: KaspaRestRequestOptions): Promise<unknown>
  getHashrate(options?: { stringOnly?: boolean } & KaspaRestRequestOptions): Promise<unknown>
  getMaxHashrate(options?: KaspaRestRequestOptions): Promise<unknown>
  getHashrateHistory(options?: { dayOrMonth?: string; resolution?: '15m' | '1h' | '3h' | '1d' | '7d' } & KaspaRestRequestOptions): Promise<unknown>
  getHashrateHistoryFor(dayOrMonth: string, resolution?: '15m' | '1h', options?: KaspaRestRequestOptions): Promise<unknown>
  getHealth(options?: KaspaRestRequestOptions): Promise<unknown>
  getMarketcap(options?: { stringOnly?: boolean } & KaspaRestRequestOptions): Promise<unknown>
  getVirtualSelectedParentBlueScore(options?: KaspaRestRequestOptions): Promise<{ blueScore: bigint }>
  getBlockDag(options?: KaspaRestRequestOptions): Promise<BlockDagInfo>
  getNetwork(options?: KaspaRestRequestOptions): Promise<BlockDagInfo>
  getCoinSupply(options?: KaspaRestRequestOptions): Promise<unknown>
  getCirculatingCoins(inBillion?: boolean, options?: KaspaRestRequestOptions): Promise<string>
  getTotalCoins(inBillion?: boolean, options?: KaspaRestRequestOptions): Promise<string>
  getKaspadInfo(options?: KaspaRestRequestOptions): Promise<unknown>
  getFeeEstimate(options?: KaspaRestRequestOptions): Promise<FeeEstimate>
  submitTransaction(tx: unknown, options?: { replaceByFee?: boolean } & KaspaRestRequestOptions): Promise<KaspaRestSubmitTransactionResponse>
  calculateTransactionMass(tx: unknown, options?: KaspaRestRequestOptions): Promise<unknown>
}

export type UseKaspaRestReturn = KaspaRestReturn

// ─── RPC Events ────────────────────────────────────────────────────────────

export type RpcEventType =
  | 'connect'
  | 'disconnect'
  | 'block-added'
  | 'virtual-chain-changed'
  | 'utxos-changed'
  | 'finality-conflict'
  | 'finality-conflict-resolved'
  | 'sink-blue-score-changed'
  | 'virtual-daa-score-changed'
  | 'new-block-template'
  | 'pruning-point-utxo-set-override'

export interface RpcEvent<T = unknown> {
  type: RpcEventType
  data: T
  timestamp: number
}

// ─── UTXO ──────────────────────────────────────────────────────────────────

export interface UtxoBalance {
  /** Confirmed, spendable balance in sompi */
  mature: bigint
  /** Unconfirmed incoming balance in sompi */
  pending: bigint
  /** Outgoing balance currently in-flight */
  outgoing: bigint
}

// ─── Transactions ───────────────────────────────────────────────────────────

export interface PaymentOutput {
  address: string
  amount: bigint
}

export interface TransactionSummary {
  /** Total fees paid across all generated transactions */
  fees: bigint
  /** Total mass of all generated transactions */
  mass: bigint
  /** Number of transactions generated (may be >1 for UTXO compounding) */
  transactions: number
  /** Transaction ID of the final transaction (set after submission) */
  finalTransactionId?: string
  /** Final output amount after fees */
  finalAmount?: bigint
}

export interface CreateTransactionSettings {
  /** UTXO entries — pass `utxo.entries.value` from useUtxo() */
  entries: UtxoEntry[]
  /** Payment outputs. Omit for a self-compound (UTXO consolidation). */
  outputs?: PaymentOutput[]
  /** Address to receive change */
  changeAddress: string
  /** Priority fee in sompi. Required when outputs are provided. */
  priorityFee?: bigint
  /** Fee rate in sompi per gram of mass (alternative to priorityFee) */
  feeRate?: number
  /** Optional data payload (hex) */
  payload?: string
  /**
   * Network ID — required when entries is a plain array (not UtxoContext).
   * E.g. 'mainnet', 'testnet-10'
   */
  networkId?: string
}

/** A signed-or-unsigned transaction ready for signing and submission */
export interface PendingTx {
  /** Sign with one or more private keys (hex strings) */
  sign(privateKeys: string[]): void
  /** Submit to the network. Requires sign() to have been called first. */
  submit(): Promise<string>
  /** Serialize to a plain object (for inspection or manual submission) */
  serialize(): unknown
  /** Addresses of all inputs — useful for selecting required private keys */
  addresses(): string[]
}

// ─── Crypto ────────────────────────────────────────────────────────────────

export interface KeypairInfo {
  privateKeyHex: string
  publicKeyHex: string
  address: string
}

export interface MnemonicInfo {
  phrase: string
  wordCount: 12 | 24
}

export interface DerivedKey {
  index: number
  publicKeyHex: string
  address: string
}

export interface SignMessageResult {
  message: string
  signature: string
  publicKeyHex: string
}

// ─── Wallet ────────────────────────────────────────────────────────────────

/** Third-party wallet provider identifier */
export type WalletProvider = 'kasware' | 'kastle'

/** Balance reported by the connected wallet (in sompi) */
export interface WalletBalance {
  confirmed: bigint
  unconfirmed: bigint
  total: bigint
}

/** Options for sendKaspa via a third-party wallet */
export interface WalletSendOptions {
  priorityFee?: bigint
  payload?: string
}

// ─── Composable Return Types ────────────────────────────────────────────────

export interface UseKaspaReturn {
  wasmStatus: Readonly<Ref<WasmStatus>>
  wasmError: Readonly<Ref<Error | null>>
  isReady: ComputedRef<boolean>
  init(): Promise<void>
  reset(): void
}

export interface UseRpcReturn {
  connectionState: Readonly<Ref<RpcConnectionState>>
  isConnected: ComputedRef<boolean>
  url: Readonly<Ref<string | null>>
  networkId: Readonly<Ref<string | null>>
  serverVersion: Readonly<Ref<string | null>>
  isSynced: Readonly<Ref<boolean>>
  virtualDaaScore: Readonly<Ref<bigint>>
  error: Readonly<Ref<Error | null>>
  connect(options?: RpcOptions): Promise<void>
  disconnect(): Promise<void>
  reconnect(): Promise<void>

  // ─── Query ───────────────────────────────────────────────────────────────
  getInfo(): Promise<ServerInfo>
  getBlock(hash: string): Promise<BlockInfo>
  getBlocks(options?: GetBlocksOptions): Promise<unknown[]>
  getBlockCount(): Promise<{ blockCount: bigint; headerCount: bigint }>
  getBlockDagInfo(): Promise<BlockDagInfo>
  getHeaders(startHash: string, limit: number, isAscending: boolean): Promise<unknown[]>
  getSink(): Promise<{ sink: string }>
  getSinkBlueScore(): Promise<{ sinkBlueScore: bigint }>
  getVirtualChainFromBlock(startHash: string, includeAcceptedTxIds: boolean): Promise<VirtualChainResult>
  getBalanceByAddress(address: string): Promise<BalanceResult>
  getBalancesByAddresses(addresses: string[]): Promise<BalanceResult[]>
  getUtxosByAddresses(addresses: string[]): Promise<UtxoEntry[]>
  getMempoolEntry(transactionId: string): Promise<MempoolEntry>
  getMempoolEntries(includeOrphanPool?: boolean): Promise<MempoolEntry[]>
  getMempoolEntriesByAddresses(addresses: string[]): Promise<MempoolEntry[]>
  getFeeEstimate(): Promise<FeeEstimate>
  getCoinSupply(): Promise<{ circulatingCoinSupply: bigint; maxCoinSupply: bigint }>
  getConnectedPeerInfo(): Promise<ConnectedPeerInfo[]>
  getPeerAddresses(): Promise<{ banned: PeerAddress[]; known: PeerAddress[] }>
  getMetrics(): Promise<unknown>
  getSyncStatus(): Promise<{ isSynced: boolean }>
  getCurrentNetwork(): Promise<string>
  getSubnetwork(subnetworkId: string): Promise<unknown>
  estimateNetworkHashesPerSecond(windowSize: number, tipHash?: string): Promise<{ networkHashesPerSecond: bigint }>
  getBlockTemplate(payAddress: string, extraData?: string): Promise<unknown>

  // ─── Transactions ────────────────────────────────────────────────────────
  submitTransaction(tx: unknown): Promise<string>

  // ─── Mining / Admin ──────────────────────────────────────────────────────
  submitBlock(block: unknown, allowNonDaaBlocks?: boolean): Promise<unknown>
  addPeer(peerAddress: string, isTrustPeer?: boolean): Promise<void>
  ban(ip: string): Promise<void>
  unban(ip: string): Promise<void>
  resolveFinalityConflict(finalityBlockHash: string): Promise<void>
  shutdown(): Promise<void>

  // ─── Subscriptions ───────────────────────────────────────────────────────
  subscribeDaaScore(): Promise<void>
  unsubscribeDaaScore(): Promise<void>
  subscribeUtxosChanged(addresses: string[]): Promise<void>
  unsubscribeUtxosChanged(addresses: string[]): Promise<void>
  subscribeVirtualChainChanged(includeAcceptedTxIds: boolean): Promise<void>
  unsubscribeVirtualChainChanged(includeAcceptedTxIds: boolean): Promise<void>
  subscribeBlockAdded(): Promise<void>
  unsubscribeBlockAdded(): Promise<void>
  subscribeFinalityConflict(): Promise<void>
  unsubscribeFinalityConflict(): Promise<void>
  subscribeFinalityConflictResolved(): Promise<void>
  unsubscribeFinalityConflictResolved(): Promise<void>
  subscribeSinkBlueScoreChanged(): Promise<void>
  unsubscribeSinkBlueScoreChanged(): Promise<void>
  subscribeVirtualDaaScoreChanged(): Promise<void>
  unsubscribeVirtualDaaScoreChanged(): Promise<void>
  subscribePruningPointUtxoSetOverride(): Promise<void>
  unsubscribePruningPointUtxoSetOverride(): Promise<void>
  subscribeNewBlockTemplate(): Promise<void>
  unsubscribeNewBlockTemplate(): Promise<void>

  // ─── Events ──────────────────────────────────────────────────────────────
  ping(): Promise<void>
  on<T = unknown>(event: RpcEventType, handler: (event: RpcEvent<T>) => void): void
  off<T = unknown>(event: RpcEventType, handler: (event: RpcEvent<T>) => void): void
  eventLog: Readonly<Ref<RpcEvent[]>>
  clearEventLog(): void
}

export interface UseUtxoReturn {
  /** Raw UTXO entries — pass directly to createTransactions() / useTransaction() */
  entries: Readonly<Ref<UtxoEntry[]>>
  /** Reactive balance computed from tracked entries */
  balance: ComputedRef<UtxoBalance>
  /** Addresses currently being tracked */
  trackedAddresses: Readonly<Ref<string[]>>
  /** True when at least one address is tracked */
  isTracking: ComputedRef<boolean>
  /** Subscribe to UTXO changes and fetch initial entries for the given addresses */
  track(addresses: string[]): Promise<void>
  /** Unsubscribe and remove entries for the given addresses */
  untrack(addresses: string[]): Promise<void>
  /** Re-fetch entries for all currently tracked addresses */
  refresh(): Promise<void>
  /** Remove all entries and unsubscribe from all addresses */
  clear(): Promise<void>
}

export interface BlockListenerOptions {
  /** Maximum number of blocks to keep in history. Default: 100 */
  maxHistory?: number
  /** Automatically subscribe when the composable mounts. Default: true */
  autoSubscribe?: boolean
}

export interface UseBlockListenerReturn {
  /** Recently added blocks, most recent first */
  blocks: Readonly<Ref<BlockInfo[]>>
  /** True while the listener is actively subscribed */
  isListening: ComputedRef<boolean>
  /** Subscribe to block-added and start collecting blocks */
  subscribe(): Promise<void>
  /** Unsubscribe and stop collecting */
  unsubscribe(): Promise<void>
  /** Clear the block history */
  clear(): void
}

export interface TransactionListenerOptions {
  /** Maximum number of transaction IDs to keep in history. Default: 100 */
  maxHistory?: number
  /** Automatically subscribe when the composable mounts. Default: true */
  autoSubscribe?: boolean
  /**
   * Resolve sender addresses for accepted transactions by fetching the
   * accepting block's full transaction data. Default: false.
   */
  includeSenderAddresses?: boolean
}

export interface AcceptedTransactionInfo {
  transactionId: string
  acceptingBlockHash: string
  senderAddresses: string[]
}

export interface UseTransactionListenerReturn {
  /** Recently accepted transaction IDs, most recent first */
  transactions: Readonly<Ref<string[]>>
  /** Accepted transactions with sender addresses, most recent first */
  acceptedTransactions: Readonly<Ref<AcceptedTransactionInfo[]>>
  /** True while the listener is actively subscribed */
  isListening: ComputedRef<boolean>
  /** Subscribe to virtual-chain-changed and start collecting transaction IDs */
  subscribe(): Promise<void>
  /** Unsubscribe and stop collecting */
  unsubscribe(): Promise<void>
  /** Clear the transaction history */
  clear(): void
  /** Resolve sender addresses for a tracked transaction ID and update the history */
  resolveSenderAddresses(transactionId: string): Promise<string[]>
}

export interface UseTransactionReturn {
  /**
   * Estimate fees without building real transactions.
   * Returns a summary with total fees, mass, and transaction count.
   */
  estimate(settings: CreateTransactionSettings): Promise<TransactionSummary>
  /**
   * Build one or more unsigned transactions.
   * Multiple transactions are generated when UTXOs need compounding.
   */
  create(settings: CreateTransactionSettings): Promise<{ transactions: PendingTx[]; summary: TransactionSummary }>
  /**
   * Build, sign, and submit all transactions in one call.
   * Returns an array of submitted transaction IDs.
   */
  send(settings: CreateTransactionSettings & { privateKeys: string[] }): Promise<string[]>
}

export interface UseCryptoReturn {
  generateMnemonic(wordCount?: 12 | 24): MnemonicInfo
  mnemonicToKeypair(phrase: string, network: KaspaNetwork): KeypairInfo
  generateKeypair(network: KaspaNetwork): KeypairInfo
  derivePublicKeys(
    phrase: string,
    network: KaspaNetwork,
    receiveCount?: number,
    changeCount?: number,
  ): { receive: DerivedKey[]; change: DerivedKey[] }
  createAddress(publicKeyHex: string, network: KaspaNetwork): string
  isValidAddress(address: string): boolean
  signMessage(message: string, privateKeyHex: string): string
  verifyMessage(message: string, signature: string, publicKeyHex: string): boolean
  kaspaToSompi(kas: string | number): bigint
  sompiToKaspa(sompi: bigint): string
  sompiToKaspaString(sompi: bigint, decimals?: number): string
}

export interface UseNetworkReturn {
  currentNetwork: Readonly<Ref<KaspaNetwork>>
  networkId: Readonly<Ref<string | null>>
  isMainnet: ComputedRef<boolean>
  isTestnet: ComputedRef<boolean>
  daaScore: Readonly<Ref<bigint>>
  switchNetwork(network: KaspaNetwork): Promise<void>
  availableNetworks: readonly KaspaNetwork[]
}

export interface UseWalletReturn {
  /** Which wallet provider is currently connected, or null */
  provider: Readonly<Ref<WalletProvider | null>>
  /** Connected account address, or null */
  address: Readonly<Ref<string | null>>
  /** Connected account public key, or null */
  publicKey: Readonly<Ref<string | null>>
  /** Wallet balance in sompi — populated for KasWare, null for Kastle */
  balance: Readonly<Ref<WalletBalance | null>>
  /** Active network reported by the wallet, or null */
  network: Readonly<Ref<string | null>>
  /** True while a connect() call is in progress */
  isConnecting: Readonly<Ref<boolean>>
  /** True when a provider is connected and an address is available */
  isConnected: ComputedRef<boolean>
  /** True when window.kasware is present */
  isKaswareInstalled: ComputedRef<boolean>
  /** True when window.kastle is present */
  isKastleInstalled: ComputedRef<boolean>
  /** Last connection error, or null */
  error: Readonly<Ref<Error | null>>
  /**
   * Connect to a wallet provider.
   * @param provider - 'kasware' or 'kastle'
   * @param network  - Target network for Kastle (e.g. 'mainnet', 'testnet-10'). Ignored for KasWare.
   */
  connect(provider: WalletProvider, network?: string): Promise<void>
  /** Disconnect the active wallet and clear all state */
  disconnect(): Promise<void>
  /**
   * Send KAS via the active wallet.
   * Only supported for KasWare. For Kastle, use window.kastle.signAndBroadcastTx() directly.
   */
  sendKaspa(to: string, amount: bigint, options?: WalletSendOptions): Promise<string>
  /**
   * Sign a message with the active wallet.
   * Only supported for KasWare.
   */
  signMessage(message: string, options?: { type?: 'schnorr' | 'ecdsa' }): Promise<string>
}

export interface UseVueKaspaReturn {
  kaspa: UseKaspaReturn
  rpc: UseRpcReturn
  utxo: UseUtxoReturn
  transaction: UseTransactionReturn
  crypto: UseCryptoReturn
  network: UseNetworkReturn
  wallet: UseWalletReturn
  rest: KaspaRestReturn
}
