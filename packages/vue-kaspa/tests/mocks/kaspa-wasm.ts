import { vi } from 'vitest'

// ─── WASM init ──────────────────────────────────────────────────────────────

export const mockWasmInit = vi.fn().mockResolvedValue(undefined)
export const initConsolePanicHook = vi.fn()
export const initBrowserPanicHook = vi.fn()

export default mockWasmInit

// ─── RpcClient ──────────────────────────────────────────────────────────────

export function createRpcClientMock() {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    url: 'ws://mock-node:17110',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),

    // ─── Subscriptions ──────────────────────────────────────────────────────
    subscribeDaaScore: vi.fn().mockResolvedValue(undefined),
    unsubscribeDaaScore: vi.fn().mockResolvedValue(undefined),
    subscribeVirtualDaaScoreChanged: vi.fn().mockResolvedValue(undefined),
    unsubscribeVirtualDaaScoreChanged: vi.fn().mockResolvedValue(undefined),
    subscribeBlockAdded: vi.fn().mockResolvedValue(undefined),
    unsubscribeBlockAdded: vi.fn().mockResolvedValue(undefined),
    subscribeUtxosChanged: vi.fn().mockResolvedValue(undefined),
    unsubscribeUtxosChanged: vi.fn().mockResolvedValue(undefined),
    subscribeVirtualChainChanged: vi.fn().mockResolvedValue(undefined),
    unsubscribeVirtualChainChanged: vi.fn().mockResolvedValue(undefined),
    subscribeFinalityConflict: vi.fn().mockResolvedValue(undefined),
    unsubscribeFinalityConflict: vi.fn().mockResolvedValue(undefined),
    subscribeFinalityConflictResolved: vi.fn().mockResolvedValue(undefined),
    unsubscribeFinalityConflictResolved: vi.fn().mockResolvedValue(undefined),
    subscribeSinkBlueScoreChanged: vi.fn().mockResolvedValue(undefined),
    unsubscribeSinkBlueScoreChanged: vi.fn().mockResolvedValue(undefined),
    subscribePruningPointUtxoSetOverride: vi.fn().mockResolvedValue(undefined),
    unsubscribePruningPointUtxoSetOverride: vi.fn().mockResolvedValue(undefined),
    subscribeNewBlockTemplate: vi.fn().mockResolvedValue(undefined),
    unsubscribeNewBlockTemplate: vi.fn().mockResolvedValue(undefined),

    // ─── Server info ────────────────────────────────────────────────────────
    getServerInfo: vi.fn().mockResolvedValue({
      isUtxoIndexEnabled: true,
      isSynced: true,
      hasNotifyCommand: true,
      hasMessageId: true,
      serverVersion: '1.1.0',
      networkId: 'kaspa-mainnet',
    }),
    getInfo: vi.fn().mockResolvedValue({
      isUtxoIndexEnabled: true,
      isSynced: true,
      hasNotifyCommand: true,
      hasMessageId: true,
      serverVersion: '1.1.0',
      networkId: 'kaspa-mainnet',
    }),
    getSyncStatus: vi.fn().mockResolvedValue({ isSynced: true }),
    getMetrics: vi.fn().mockResolvedValue({
      processMetrics: {},
      connectionMetrics: { connectedPeers: 8 },
      bandwidthMetrics: {},
      consensusMetrics: {},
      storageMetrics: {},
      blockchainMetrics: {},
    }),

    // ─── Block queries ──────────────────────────────────────────────────────
    getBlock: vi.fn().mockImplementation(async (request?: { includeTransactions?: boolean; hash?: string }) => {
      if (request?.includeTransactions) {
        return {
          block: {
            verboseData: { hash: request.hash ?? 'mock-hash', timestamp: '1000000', blueScore: '100' },
            transactions: [
              {
                id: 'mock-txid',
                inputs: [{ address: 'kaspa:qrmocksender' }],
                outputs: [],
              },
            ],
          },
        }
      }

      return {
        block: { verboseData: { hash: request?.hash ?? 'mock-hash', timestamp: '1000000', blueScore: '100' }, transactions: [] },
      }
    }),
    getBlocks: vi.fn().mockResolvedValue({ blockHashes: ['mock-hash-1', 'mock-hash-2'], blocks: [] }),
    getBlockCount: vi.fn().mockResolvedValue({ blockCount: 1000n, headerCount: 1000n }),
    getBlockDagInfo: vi.fn().mockResolvedValue({
      networkName: 'kaspa-mainnet',
      blockCount: 1000n,
      headerCount: 1000n,
      tipHashes: ['mock-tip-hash'],
      difficulty: 1234567.89,
      pastMedianTime: 1700000000000n,
      virtualParentHashes: ['mock-parent-hash'],
      pruningPointHash: 'mock-pruning-hash',
      virtualDaaScore: 500000n,
    }),
    getHeaders: vi.fn().mockResolvedValue({ headers: [] }),
    getSink: vi.fn().mockResolvedValue({ sink: 'mock-sink-hash' }),
    getSinkBlueScore: vi.fn().mockResolvedValue({ sinkBlueScore: 100n }),
    getVirtualChainFromBlock: vi.fn().mockResolvedValue({
      removedChainBlockHashes: [],
      addedChainBlockHashes: ['mock-added-hash'],
      acceptedTransactionIds: [],
    }),
    getBlockTemplate: vi.fn().mockResolvedValue({ block: {} }),

    // ─── Balance / UTXO ─────────────────────────────────────────────────────
    getBalanceByAddress: vi.fn().mockResolvedValue({ balance: 1_000_000_000n }),
    getBalancesByAddresses: vi.fn().mockResolvedValue({ balances: [] }),
    getUtxosByAddresses: vi.fn().mockResolvedValue({ entries: [] }),

    // ─── Mempool ────────────────────────────────────────────────────────────
    getMempoolEntry: vi.fn().mockResolvedValue({
      mempoolEntry: { fee: 1000n, isOrphan: false, transaction: { id: 'mock-txid', inputs: [], outputs: [] } },
    }),
    getMempoolEntries: vi.fn().mockResolvedValue({ mempoolEntries: [] }),
    getMempoolEntriesByAddresses: vi.fn().mockResolvedValue({ addressEntries: [] }),

    // ─── Fee / supply ───────────────────────────────────────────────────────
    getFeeEstimate: vi.fn().mockResolvedValue({
      estimate: {
        priorityBucket: { feerate: 1.0, estimatedSeconds: 10 },
        normalBuckets: [],
        lowBuckets: [],
      },
    }),
    getCoinSupply: vi.fn().mockResolvedValue({
      circulatingCoinSupply: 20_000_000_000n,
      maxCoinSupply: 28_700_000_000n,
    }),

    // ─── Network / peers ────────────────────────────────────────────────────
    getConnectedPeerInfo: vi.fn().mockResolvedValue({ peerInfo: [] }),
    getPeerAddresses: vi.fn().mockResolvedValue({ banned: [], known: [] }),
    getCurrentNetwork: vi.fn().mockResolvedValue({ currentNetwork: 'mainnet' }),
    getSubnetwork: vi.fn().mockResolvedValue({}),
    estimateNetworkHashesPerSecond: vi.fn().mockResolvedValue({ networkHashesPerSecond: 1_000_000n }),

    // ─── Transactions / Mining / Admin ──────────────────────────────────────
    submitTransaction: vi.fn().mockResolvedValue({ transactionId: 'mock-txid-0000' }),
    submitBlock: vi.fn().mockResolvedValue({ report: {} }),
    addPeer: vi.fn().mockResolvedValue(undefined),
    ban: vi.fn().mockResolvedValue(undefined),
    unban: vi.fn().mockResolvedValue(undefined),
    resolveFinalityConflict: vi.fn().mockResolvedValue(undefined),
    shutdown: vi.fn().mockResolvedValue(undefined),
    ping: vi.fn().mockResolvedValue(undefined),
  }
}

export const RpcClient = vi.fn(function RpcClientImpl(_config?: Record<string, unknown>) {
  return createRpcClientMock()
})

// ─── Resolver ──────────────────────────────────────────────────────────────

export const Resolver = vi.fn(function ResolverImpl() { return {} })

// ─── Transaction building ────────────────────────────────────────────────────

export function createPendingTxMock(txId = 'mock-txid') {
  return {
    sign: vi.fn(),
    serializeToObject: vi.fn().mockReturnValue({ version: 0, inputs: [], outputs: [] }),
    addresses: vi.fn().mockReturnValue([{ toString: () => 'kaspa:qrmockaddress' }]),
  }
}

export const mockGeneratorSummary = {
  fees: 1000n,
  mass: 2036n,
  transactions: 1,
  finalTransactionId: undefined,
  finalAmount: undefined,
}

export const createTransactions = vi.fn().mockResolvedValue({
  transactions: [createPendingTxMock()],
  summary: mockGeneratorSummary,
})

export const estimateTransactions = vi.fn().mockResolvedValue(mockGeneratorSummary)

// ─── Cryptography ──────────────────────────────────────────────────────────

export const PrivateKey = vi.fn(function PrivateKeyImpl(hex: string) { return {
  toKeypair: vi.fn().mockReturnValue({
    toAddress: vi.fn().mockReturnValue({ toString: () => 'kaspa:qrmockaddressfromkey' }),
    publicKey: 'mock-public-key-hex',
  }),
  toPublicKey: vi.fn().mockReturnValue({
    toString: () => 'mock-public-key-hex',
    toAddress: vi.fn().mockReturnValue({ toString: () => 'kaspa:qrmockaddressfrompubkey' }),
  }),
  toString: () => hex,
}})

export const PublicKey = vi.fn(function PublicKeyImpl(hex: string) { return {
  toAddress: vi.fn().mockReturnValue({ toString: () => 'kaspa:qrmockaddressfrompubkey' }),
  toString: () => hex,
}})

export const Keypair = vi.fn()

// v1.1.0: Mnemonic.toSeed() returns a hex string
export const Mnemonic = vi.fn(function MnemonicImpl(phrase: string) {
  return {
    phrase,
    toSeed: vi.fn().mockReturnValue('a'.repeat(128)), // 64 bytes as hex string
  }
}) as unknown as {
  new(phrase: string): { phrase: string; toSeed: () => string }
  random(wordCount?: number | null): { phrase: string; entropy: string; toSeed: () => string }
}
;(Mnemonic as unknown as { random: ReturnType<typeof vi.fn> }).random = vi.fn().mockReturnValue({
  phrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  entropy: 'mock-entropy',
  toSeed: vi.fn().mockReturnValue('a'.repeat(128)),
})

export const XPrv = vi.fn(function XPrvImpl(seed: string) {
  return { seed }
})

export const PrivateKeyGenerator = vi.fn(function PrivateKeyGeneratorImpl(_xprv: unknown, _isMultisig: boolean, _accountIndex: bigint) {
  return {
    receiveKey: vi.fn().mockImplementation((index: number) => ({
      toPublicKey: vi.fn().mockReturnValue({ toString: () => `mock-receive-pubkey-${index}` }),
      toAddress: vi.fn().mockReturnValue({ toString: () => `kaspa:qrmockreceive${index}` }),
    })),
    changeKey: vi.fn().mockImplementation((index: number) => ({
      toPublicKey: vi.fn().mockReturnValue({ toString: () => `mock-change-pubkey-${index}` }),
      toAddress: vi.fn().mockReturnValue({ toString: () => `kaspa:qrmockchange${index}` }),
    })),
  }
})

export const PublicKeyGenerator = {
  fromMasterXPrv: vi.fn().mockResolvedValue({
    receivePubkeys: vi.fn().mockResolvedValue(
      Array.from({ length: 10 }, (_, i) => `mock-pubkey-receive-${i}`),
    ),
    changePubkeys: vi.fn().mockResolvedValue(
      Array.from({ length: 10 }, (_, i) => `mock-pubkey-change-${i}`),
    ),
  }),
}

export const createAddress = vi.fn().mockReturnValue({
  toString: () => 'kaspa:qrmockcreatedaddress',
})

export const Transaction = vi.fn(function TransactionImpl(value: any) {
  return {
    id: value?.id ?? 'mock-transaction-id',
    addresses: vi.fn().mockImplementation((network: string) => {
      const inputs = Array.isArray(value?.inputs) ? value.inputs : []
      const senderAddresses = inputs
        .map((input: any) => input?.address ?? input?.utxo?.address ?? input?.previousOutpoint?.address)
        .filter(Boolean)
      if (senderAddresses.length > 0) {
        return senderAddresses.map((address: string) => ({ toString: () => address }))
      }
      return [{ toString: () => `kaspa:qrmocksender-${network}` }]
    }),
  }
})

// v1.1.0: Address is a class with constructor + static validate()
export const Address = vi.fn(function AddressImpl(address: string) {
  return {
    toString: () => address,
    prefix: 'kaspa',
    payload: 'qrmockpayload',
    version: 'PubKey',
  }
}) as unknown as {
  new(address: string): { toString(): string; prefix: string; payload: string; version: string }
  validate(address: string): boolean
}
;(Address as unknown as { validate: ReturnType<typeof vi.fn> }).validate = vi.fn().mockImplementation(
  (addr: string) => typeof addr === 'string' && addr.startsWith('kaspa:')
)

export const addressFromScriptPublicKey = vi.fn().mockReturnValue({
  toString: () => 'kaspa:qrmockscriptaddress',
})

export const ScriptBuilder = vi.fn().mockImplementation(() => ({
  addOp: vi.fn().mockReturnThis(),
  addData: vi.fn().mockReturnThis(),
  build: vi.fn().mockReturnValue('mock-script'),
}))

export const Opcodes = {
  OpTrue: 0x51,
  OpFalse: 0x00,
  OpCheckSig: 0xac,
  OpCheckMultiSig: 0xae,
}

// v1.1.0: signMessage/verifyMessage take object arguments
export const signMessage = vi.fn().mockImplementation(
  (_args: { message: string; privateKey: string }) => 'mock-signature-hex'
)
export const verifyMessage = vi.fn().mockImplementation(
  (_args: { message: string; signature: string; publicKey: string }) => true
)

// ─── Unit conversion ───────────────────────────────────────────────────────

// v1.1.0: kaspaToSompi returns bigint | undefined
export const kaspaToSompi = vi.fn().mockImplementation((kas: string) => {
  const n = parseFloat(kas)
  if (isNaN(n)) return undefined
  return BigInt(Math.round(n * 1_000_000_000))
})

export const sompiToKaspaString = vi.fn().mockImplementation((sompi: bigint) => {
  return (Number(sompi) / 1_000_000_000).toFixed(8)
})

export const sompiToKaspaStringWithSuffix = vi.fn().mockImplementation((sompi: bigint) => {
  return (Number(sompi) / 1_000_000_000).toFixed(8) + ' KAS'
})

// ─── Hashing ───────────────────────────────────────────────────────────────

export const sha256FromText = vi.fn().mockReturnValue('mock-sha256-hash')
export const sha256dFromText = vi.fn().mockReturnValue('mock-sha256d-hash')

// ─── NetworkType / NetworkId / Encoding ──────────────────────────────────

export enum NetworkType {
  Mainnet = 0,
  Testnet = 1,
  Devnet = 2,
  Simnet = 3,
}

export const NetworkId = vi.fn().mockImplementation((id: string) => ({
  id,
  toString: () => id,
}))

export enum Encoding {
  Borsh = 0,
  SerdeJson = 1,
}
