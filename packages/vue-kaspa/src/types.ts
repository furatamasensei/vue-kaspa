import type { Ref, ComputedRef } from 'vue'

// ─── Plugin Options ────────────────────────────────────────────────────────

export interface KaspaPluginOptions {
  /** Network to connect to. Default: 'mainnet' */
  network?: KaspaNetwork
  /** RPC endpoint URL (e.g. 'ws://127.0.0.1:17110'). Mutually exclusive with resolver. */
  url?: string
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

export type KaspaNetwork = 'mainnet' | 'testnet-10' | 'testnet-11' | 'simnet' | 'devnet'

export type RpcEncoding = 'Borsh' | 'SerdeJson'

export const AVAILABLE_NETWORKS: readonly KaspaNetwork[] = [
  'mainnet',
  'testnet-10',
  'testnet-11',
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

export interface UtxoEntry {
  address: string | null
  outpoint: { transactionId: string; index: number }
  utxoEntry: {
    amount: bigint
    scriptPublicKey: { version: number; script: string }
    blockDaaScore: bigint
    isCoinbase: boolean
  }
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

// ─── Wallet ────────────────────────────────────────────────────────────────

export type WalletStatus = 'uninitialized' | 'closed' | 'opening' | 'open' | 'error'

export interface WalletBalance {
  mature: bigint
  pending: bigint
  outgoing: bigint
}

export interface AccountInfo {
  id: string
  name: string
  receiveAddress: string
  changeAddress: string
  balance: WalletBalance
}

export interface SendParams {
  accountId: string
  address: string
  amount: bigint
  priorityFee?: bigint
  password: string
}

export interface TransferParams {
  fromAccountId: string
  toAccountId: string
  amount: bigint
  priorityFee?: bigint
  password: string
}

export interface WalletCreateParams {
  walletSecret: string
  walletName?: string
  accountName?: string
}

export interface WalletOpenParams {
  walletSecret: string
}

export interface TransactionCursor {
  start: number
  end: number
}

export interface TransactionRecord {
  id: string
  type: 'incoming' | 'outgoing' | 'transfer-incoming' | 'transfer-outgoing' | 'batch' | 'reorg'
  value: bigint
  timestamp?: number
}

export interface TransactionPage {
  transactions: TransactionRecord[]
  total: number
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
  getInfo(): Promise<ServerInfo>
  getBlock(hash: string): Promise<BlockInfo>
  getBlockCount(): Promise<{ blockCount: bigint; headerCount: bigint }>
  getBalanceByAddress(address: string): Promise<BalanceResult>
  getBalancesByAddresses(addresses: string[]): Promise<BalanceResult[]>
  getUtxosByAddresses(addresses: string[]): Promise<UtxoEntry[]>
  getMempoolEntries(includeOrphanPool?: boolean): Promise<MempoolEntry[]>
  getMempoolEntriesByAddresses(addresses: string[]): Promise<MempoolEntry[]>
  getFeeEstimate(): Promise<FeeEstimate>
  submitTransaction(tx: unknown): Promise<string>
  getCoinSupply(): Promise<{ circulatingCoinSupply: bigint; maxCoinSupply: bigint }>
  ping(): Promise<void>
  on<T = unknown>(event: RpcEventType, handler: (event: RpcEvent<T>) => void): void
  off<T = unknown>(event: RpcEventType, handler: (event: RpcEvent<T>) => void): void
  eventLog: Readonly<Ref<RpcEvent[]>>
  clearEventLog(): void
}

export interface UseWalletReturn {
  walletStatus: Readonly<Ref<WalletStatus>>
  isOpen: ComputedRef<boolean>
  accounts: Readonly<Ref<AccountInfo[]>>
  activeAccount: Readonly<Ref<AccountInfo | null>>
  isSyncing: Readonly<Ref<boolean>>
  error: Readonly<Ref<Error | null>>
  create(params: WalletCreateParams): Promise<void>
  open(params: WalletOpenParams): Promise<void>
  close(): Promise<void>
  exists(): Promise<boolean>
  createAccount(name?: string, password?: string): Promise<AccountInfo>
  setActiveAccount(accountId: string): void
  send(params: SendParams): Promise<string>
  transfer(params: TransferParams): Promise<string>
  getTransactions(accountId: string, cursor?: TransactionCursor): Promise<TransactionPage>
  getBalance(accountId?: string): ComputedRef<WalletBalance>
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
