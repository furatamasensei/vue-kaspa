import { computed, inject, ref } from 'vue'
import { KaspaRestError } from '../errors'
import { getKaspa } from '../internal/kaspa'
import { clearRestCache, getCachedRestValue, getRestCacheSize } from '../internal/rest-cache'
import { getCurrentNetworkRef } from './useNetwork'
import { KASPA_OPTIONS_KEY } from '../symbols'
import type {
  KaspaNetwork,
  FeeEstimate,
  KaspaRestAddressBalanceHistory,
  KaspaRestAddressName,
  KaspaRestAddressesActiveCountResponse,
  KaspaRestBalancesByAddressEntry,
  KaspaRestBalanceResponse,
  KaspaRestBlock,
  KaspaRestBlockResponse,
  KaspaRestBlockRewardResponse,
  KaspaRestBlockdagResponse,
  KaspaRestBlueScoreResponse,
  KaspaRestCoinSupplyResponse,
  KaspaRestDistributionTiers,
  KaspaRestHashrateHistoryResponse,
  KaspaRestHashrateResponse,
  KaspaRestHealthResponse,
  KaspaRestKaspadInfoResponse,
  KaspaRestMarketCapResponse,
  KaspaRestOptions,
  KaspaRestOutpoint,
  KaspaRestPriceResponse,
  KaspaRestRequestOptions,
  KaspaRestReturn,
  KaspaRestSubmitTxModel,
  KaspaRestTransaction,
  KaspaRestTransactionAcceptance,
  KaspaRestTransactionCount,
  KaspaRestTransactionCountResponse,
  KaspaRestSubmitTransactionResponse,
  KaspaRestTopAddresses,
  KaspaRestTxMass,
  KaspaRestTxOutput,
  KaspaRestTxSearch,
  KaspaRestUtxoCountResponse,
  KaspaRestUtxoResponse,
  KaspaRestVcBlock,
  KaspaRestBlockdagResponse as _KaspaRestBlockdagResponse,
  UtxoEntry,
  VueKaspaOptions,
} from '../types'

const DEFAULT_REST_URL = 'https://api.kaspa.org'
const NETWORK_REST_URLS: Record<KaspaNetwork, string> = {
  mainnet: 'https://api.kaspa.org',
  'testnet-10': 'https://api-tn10.kaspa.org',
  'testnet-12': 'https://api-tn12.kaspa.org',
  simnet: 'https://api.kaspa.org',
  devnet: 'https://api.kaspa.org',
}
const DEFAULT_STALE_TIME = 30_000
const DEFAULT_CACHE_TIME = 300_000

type RestFetcher = typeof fetch
type AnyOptions = Record<string, any>

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)))
}

function resolveDefaultRestUrl(network: KaspaNetwork): string {
  return NETWORK_REST_URLS[network] ?? DEFAULT_REST_URL
}

function normalizeTransaction(raw: KaspaRestTransaction, network?: string): KaspaRestTransaction {
  const senderAddresses = raw.senderAddresses?.length ? dedupe(raw.senderAddresses) : extractSenderAddresses(raw, network)
  return {
    ...raw,
    ...(raw.transactionId ? { transactionId: raw.transactionId } : raw.transaction_id ? { transactionId: raw.transaction_id } : {}),
    ...(raw.acceptingBlockHash ? { acceptingBlockHash: raw.acceptingBlockHash } : raw.accepting_block_hash ? { acceptingBlockHash: raw.accepting_block_hash } : {}),
    ...(raw.acceptingBlockBlueScore !== undefined ? { acceptingBlockBlueScore: raw.acceptingBlockBlueScore } : raw.accepting_block_blue_score !== undefined ? { acceptingBlockBlueScore: raw.accepting_block_blue_score } : {}),
    ...(raw.acceptingBlockTime !== undefined ? { acceptingBlockTime: raw.acceptingBlockTime } : raw.accepting_block_time !== undefined ? { acceptingBlockTime: raw.accepting_block_time } : {}),
    senderAddresses,
  }
}

function extractSenderAddresses(raw: KaspaRestTransaction, network?: string): string[] {
  const addresses = new Set<string>()
  const inputs = Array.isArray(raw.inputs) ? raw.inputs : []

  for (const input of inputs) {
    const candidates = [
      input.address,
      input.previous_outpoint_address,
      input.previousOutpoint?.address,
      input.previousOutpoint?.scriptPublicKey?.script,
      input.previousOutpoint?.scriptPublicKeyAddress,
      input.previous_outpoint_resolved?.script_public_key_address,
      input.previous_outpoint_resolved?.script_public_key,
      input.utxo?.address,
    ]

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.length > 0) {
        addresses.add(candidate)
      }
    }
  }

  if (addresses.size > 0) {
    return Array.from(addresses)
  }

  try {
    const kaspa = getKaspa()
    const networkId = network ?? 'mainnet'
    for (const input of inputs) {
      const scriptPublicKey =
        input.previous_outpoint_resolved?.script_public_key
        ?? input.previousOutpoint?.scriptPublicKey?.script
      if (!scriptPublicKey) continue
      const derived = kaspa.addressFromScriptPublicKey(scriptPublicKey as never, networkId)
      if (derived) {
        addresses.add(derived.toString())
      }
    }
  } catch {
    // WASM not available or address derivation failed; fall back to direct addresses only.
  }

  return Array.from(addresses)
}

function toQueryString(query?: Record<string, string | number | boolean | bigint | undefined | null>): string {
  if (!query) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, typeof value === 'bigint' ? value.toString() : String(value))
  }
  const str = search.toString()
  return str ? `?${str}` : ''
}

function buildCacheKey(baseUrl: string, method: string, path: string, query?: Record<string, unknown>, body?: unknown): string {
  return JSON.stringify([baseUrl, method, path, query ?? null, body ?? null])
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  return response.text()
}

export function useKaspaRest(options: KaspaRestOptions = {}): KaspaRestReturn {
  const pluginOptions = inject<VueKaspaOptions>(KASPA_OPTIONS_KEY, {})
  const currentNetwork = getCurrentNetworkRef()
  if (pluginOptions.network && currentNetwork.value === 'mainnet') {
    currentNetwork.value = pluginOptions.network
  }

  const baseUrl = computed(() => {
    if (options.baseUrl) return options.baseUrl
    if (pluginOptions.restUrl) return pluginOptions.restUrl
    return resolveDefaultRestUrl(currentNetwork.value)
  })
  const staleTime = options.staleTime ?? DEFAULT_STALE_TIME
  const cacheTime = options.cacheTime ?? DEFAULT_CACHE_TIME
  const headers = options.headers
  const fetcher: RestFetcher = options.fetcher ?? fetch

  async function request<T = unknown>(
    method: 'GET' | 'POST',
    path: string,
    requestOptions: {
      query?: Record<string, string | number | boolean | bigint | undefined | null>
      body?: unknown
      cacheKey?: string
    } & KaspaRestRequestOptions = {},
  ): Promise<T> {
    const url = `${baseUrl.value}${path}${toQueryString(requestOptions.query)}`
    const key = requestOptions.cacheKey ?? buildCacheKey(baseUrl.value, method, path, requestOptions.query, requestOptions.body)
    const shouldCache = (requestOptions.cache !== false && method === 'GET') || requestOptions.cacheKey !== undefined

    const loader = async (): Promise<T> => {
      const requestHeaders = new Headers(headers ?? undefined)
      requestHeaders.set('Accept', 'application/json')
      if (requestOptions.body !== undefined) {
        requestHeaders.set('Content-Type', 'application/json')
      }

      const init: RequestInit = {
        method,
        headers: requestHeaders,
      }

      if (requestOptions.body !== undefined) {
        init.body = JSON.stringify(requestOptions.body)
      }

      const response = await fetcher(url, init)

      if (!response.ok) {
        const body = await readResponseBody(response).catch(() => undefined)
        throw new KaspaRestError(`${method} ${path}`, new Error(`HTTP ${response.status} ${response.statusText}${body ? `: ${JSON.stringify(body)}` : ''}`))
      }

      return (await readResponseBody(response)) as T
    }

    if (!shouldCache) {
      return loader()
    }

    return getCachedRestValue(
      key,
      loader,
      requestOptions.staleTime ?? staleTime,
      cacheTime,
      requestOptions.forceRefresh,
    )
  }

  function normalizeTransactions(result: unknown): KaspaRestTransaction[] {
    if (!Array.isArray(result)) return []
    const network = currentNetwork.value
    return result
      .filter(isObject)
      .map((item) => normalizeTransaction(item as KaspaRestTransaction, network))
  }

  return {
    baseUrl: computed(() => baseUrl.value),
    cacheSize: computed(() => getRestCacheSize()),
    clearCache(prefix?: string): void {
      clearRestCache(prefix)
    },

    request,

    async getBlock(hash: string, includeTransactions = false) {
      return request('GET', `/blocks/${encodeURIComponent(hash)}`, {
        query: { includeTransactions },
        cacheKey: buildCacheKey(baseUrl.value, 'GET', `/blocks/${hash}`, { includeTransactions }),
      })
    },

    async getBlocks(options: AnyOptions = {}) {
      return request('GET', '/blocks', {
        query: {
          lowHash: options.lowHash,
          includeBlocks: options.includeBlocks ?? true,
          includeTransactions: options.includeTransactions ?? false,
        },
      })
    },

    async getBlocksFromBlueScore(options: AnyOptions) {
      return request('GET', '/blocks-from-bluescore', {
        query: {
          blueScore: options.blueScore,
          blueScoreGte: options.blueScoreGte,
          blueScoreLt: options.blueScoreLt,
          includeTransactions: options.includeTransactions ?? false,
        },
      })
    },

    async getAddressBalance(address: string, requestOptions: AnyOptions = {}) {
      return request('GET', `/addresses/${encodeURIComponent(address)}/balance`, {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', `/addresses/${address}/balance`),
        ...requestOptions,
      })
    },

    async getAddressBalanceHistory(address: string, dayOrMonth: string, requestOptions: AnyOptions = {}) {
      return request('GET', `/addresses/${encodeURIComponent(address)}/balance/${encodeURIComponent(dayOrMonth)}`, {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', `/addresses/${address}/balance/${dayOrMonth}`),
        ...requestOptions,
      })
    },

    async getUtxosByAddress(address: string, requestOptions: AnyOptions = {}) {
      const result = await request<KaspaRestUtxoResponse[]>('GET', `/addresses/${encodeURIComponent(address)}/utxos`, {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', `/addresses/${address}/utxos`),
        ...requestOptions,
      })
      return Array.isArray(result) ? result : []
    },

    async getUtxosByAddresses(addresses: string[], requestOptions: AnyOptions = {}) {
      const result = await request<KaspaRestUtxoResponse[]>('POST', '/addresses/utxos', {
        body: { addresses },
        cacheKey: buildCacheKey(baseUrl.value, 'POST', '/addresses/utxos', {}, { addresses }),
        ...requestOptions,
      })
      return Array.isArray(result) ? result : []
    },

    async getUtxoCountByAddress(address: string, requestOptions: AnyOptions = {}) {
      return request('GET', `/addresses/${encodeURIComponent(address)}/utxos/count`, {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', `/addresses/${address}/utxos/count`),
        ...requestOptions,
      })
    },

    async searchTransactions(requestBody: KaspaRestTxSearch, requestOptions: AnyOptions = {}) {
      const result = await request<unknown>('POST', '/transactions/search', {
        body: requestBody,
        query: {
          resolve_previous_outpoints: requestOptions.resolvePreviousOutpoints ?? 'no',
          acceptance: requestOptions.acceptance,
        },
        cacheKey: buildCacheKey(baseUrl.value, 'POST', '/transactions/search', {
          resolve_previous_outpoints: requestOptions.resolvePreviousOutpoints ?? 'no',
          acceptance: requestOptions.acceptance,
        }, requestBody),
        ...requestOptions,
      })
      return normalizeTransactions(result)
    },

    async getTransaction(transactionId: string, requestOptions: AnyOptions = {}) {
      const result = await request<KaspaRestTransaction[]>('POST', '/transactions/search', {
        body: { transactionIds: [transactionId] },
        query: {
          resolve_previous_outpoints: requestOptions.resolvePreviousOutpoints ?? 'no',
          acceptance: requestOptions.acceptance,
        },
        cacheKey: buildCacheKey(baseUrl.value, 'POST', '/transactions/search', {
          resolve_previous_outpoints: requestOptions.resolvePreviousOutpoints ?? 'no',
          acceptance: requestOptions.acceptance,
        }, { transactionIds: [transactionId] }),
        ...requestOptions,
      })
      return normalizeTransactions(result)[0] ?? null
    },

    async getTransactionById(transactionId: string, requestOptions: AnyOptions = {}) {
      try {
        const result = await request<KaspaRestTransaction>('GET', `/transactions/${encodeURIComponent(transactionId)}`, {
          query: {
            resolve_previous_outpoints: requestOptions.resolvePreviousOutpoints ?? 'no',
            acceptance: requestOptions.acceptance,
          },
          cacheKey: buildCacheKey(baseUrl.value, 'GET', `/transactions/${transactionId}`, {
            resolve_previous_outpoints: requestOptions.resolvePreviousOutpoints ?? 'no',
            acceptance: requestOptions.acceptance,
          }),
          ...requestOptions,
        })
        const normalized = normalizeTransactions([result])
        return normalized[0] ?? null
      } catch (error) {
        if (error instanceof KaspaRestError && error.message.includes('HTTP 404')) {
          return null
        }
        throw error
      }
    },

    async getTransactionAcceptance(transactionIds: string[], requestOptions: AnyOptions = {}) {
      return request<KaspaRestTransactionAcceptance[]>('POST', '/transactions/acceptance', {
        body: { transactionIds },
        cacheKey: buildCacheKey(baseUrl.value, 'POST', '/transactions/acceptance', {}, { transactionIds }),
        ...requestOptions,
      })
    },

    async getFullTransactionsByAddress(address: string, requestOptions: AnyOptions = {}) {
      const result = await request<unknown>('GET', `/addresses/${encodeURIComponent(address)}/full-transactions`, {
        query: {
          limit: requestOptions.limit,
          offset: requestOptions.offset,
          fields: requestOptions.fields,
          resolve_previous_outpoints: requestOptions.resolvePreviousOutpoints ?? 'full',
          acceptance: requestOptions.acceptance,
        },
        cacheKey: buildCacheKey(baseUrl.value, 'GET', `/addresses/${address}/full-transactions`, {
          limit: requestOptions.limit,
          offset: requestOptions.offset,
          fields: requestOptions.fields,
          resolve_previous_outpoints: requestOptions.resolvePreviousOutpoints ?? 'full',
          acceptance: requestOptions.acceptance,
        }),
        ...requestOptions,
      })
      return normalizeTransactions(result)
    },

    async getFullTransactionsByAddressPage(address: string, requestOptions: AnyOptions = {}) {
      const result = await request<unknown>('GET', `/addresses/${encodeURIComponent(address)}/full-transactions-page`, {
        query: {
          limit: requestOptions.limit,
          before: requestOptions.before,
          after: requestOptions.after,
          fields: requestOptions.fields,
          resolve_previous_outpoints: requestOptions.resolvePreviousOutpoints ?? 'full',
          acceptance: requestOptions.acceptance,
        },
        cacheKey: buildCacheKey(baseUrl.value, 'GET', `/addresses/${address}/full-transactions-page`, {
          limit: requestOptions.limit,
          before: requestOptions.before,
          after: requestOptions.after,
          fields: requestOptions.fields,
          resolve_previous_outpoints: requestOptions.resolvePreviousOutpoints ?? 'full',
          acceptance: requestOptions.acceptance,
        }),
        ...requestOptions,
      })
      return normalizeTransactions(result)
    },

    async getAddressTransactionCount(address: string, requestOptions: AnyOptions = {}) {
      return request<KaspaRestTransactionCount>('GET', `/addresses/${encodeURIComponent(address)}/transactions-count`, {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', `/addresses/${address}/transactions-count`),
        ...requestOptions,
      })
    },

    async getAddressesActiveCount(requestOptions: AnyOptions = {}) {
      return request('GET', '/addresses/active/count/', {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/addresses/active/count/'),
        ...requestOptions,
      })
    },

    async getAddressesActiveCountFor(dayOrMonth: string, requestOptions: AnyOptions = {}) {
      return request('GET', `/addresses/active/count/${encodeURIComponent(dayOrMonth)}`, {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', `/addresses/active/count/${dayOrMonth}`),
        ...requestOptions,
      })
    },

    async getBalancesByAddresses(addresses: string[], requestOptions: AnyOptions = {}) {
      return request<KaspaRestBalancesByAddressEntry[]>('POST', '/addresses/balances', {
        body: { addresses },
        cacheKey: buildCacheKey(baseUrl.value, 'POST', '/addresses/balances', {}, { addresses }),
        ...requestOptions,
      })
    },

    async getAddressNames(requestOptions: AnyOptions = {}) {
      return request('GET', '/addresses/names', {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/addresses/names'),
        ...requestOptions,
      })
    },

    async getAddressName(address: string, requestOptions: AnyOptions = {}) {
      return request('GET', `/addresses/${encodeURIComponent(address)}/name`, {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', `/addresses/${address}/name`),
        ...requestOptions,
      })
    },

    async getTopAddresses(requestOptions: AnyOptions = {}) {
      return request('GET', '/addresses/top', {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/addresses/top'),
        ...requestOptions,
      })
    },

    async getBlockReward(requestOptions: AnyOptions = {}) {
      return request('GET', '/info/blockreward', {
        query: { stringOnly: requestOptions.stringOnly ?? false },
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/info/blockreward', { stringOnly: requestOptions.stringOnly ?? false }),
        ...requestOptions,
      })
    },

    async getHalving(field?: string, requestOptions: AnyOptions = {}) {
      return request('GET', '/info/halving', {
        query: { field },
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/info/halving', { field }),
        ...requestOptions,
      })
    },

    async getHashrate(requestOptions: AnyOptions = {}) {
      return request('GET', '/info/hashrate', {
        query: { stringOnly: requestOptions.stringOnly ?? false },
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/info/hashrate', { stringOnly: requestOptions.stringOnly ?? false }),
        ...requestOptions,
      })
    },

    async getMaxHashrate(requestOptions: AnyOptions = {}) {
      return request('GET', '/info/hashrate/max', {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/info/hashrate/max'),
        ...requestOptions,
      })
    },

    async getHashrateHistory(requestOptions: AnyOptions = {}) {
      return request('GET', '/info/hashrate/history', {
        query: { resolution: requestOptions.resolution },
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/info/hashrate/history', { resolution: requestOptions.resolution }),
        ...requestOptions,
      })
    },

    async getHashrateHistoryFor(dayOrMonth: string, resolution?: '15m' | '1h', requestOptions: AnyOptions = {}) {
      return request('GET', `/info/hashrate/history/${encodeURIComponent(dayOrMonth)}`, {
        query: { resolution },
        cacheKey: buildCacheKey(baseUrl.value, 'GET', `/info/hashrate/history/${dayOrMonth}`, { resolution }),
        ...requestOptions,
      })
    },

    async getHealth(requestOptions: AnyOptions = {}) {
      return request('GET', '/info/health', {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/info/health'),
        ...requestOptions,
      })
    },

    async getMarketcap(requestOptions: AnyOptions = {}) {
      return request('GET', '/info/marketcap', {
        query: { stringOnly: requestOptions.stringOnly ?? false },
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/info/marketcap', { stringOnly: requestOptions.stringOnly ?? false }),
        ...requestOptions,
      })
    },

    async getVirtualSelectedParentBlueScore(requestOptions: AnyOptions = {}) {
      return request<KaspaRestBlueScoreResponse>('GET', '/info/virtual-chain-blue-score', {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/info/virtual-chain-blue-score'),
        ...requestOptions,
      })
    },

    async getBlockDag(requestOptions: AnyOptions = {}) {
      return request<KaspaRestBlockdagResponse>('GET', '/info/blockdag', {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/info/blockdag'),
        ...requestOptions,
      })
    },

    async getNetwork(requestOptions: AnyOptions = {}) {
      return request<KaspaRestBlockdagResponse>('GET', '/info/network', {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/info/network'),
        ...requestOptions,
      })
    },

    async getCoinSupply(requestOptions: AnyOptions = {}) {
      return request('GET', '/info/coinsupply', {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/info/coinsupply'),
        ...requestOptions,
      })
    },

    async getCirculatingCoins(inBillion = false, requestOptions: AnyOptions = {}): Promise<string> {
      return request('GET', '/info/coinsupply/circulating', {
        query: { in_billion: inBillion },
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/info/coinsupply/circulating', { in_billion: inBillion }),
        ...requestOptions,
      }) as Promise<string>
    },

    async getTotalCoins(inBillion = false, requestOptions: AnyOptions = {}): Promise<string> {
      return request('GET', '/info/coinsupply/total', {
        query: { in_billion: inBillion },
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/info/coinsupply/total', { in_billion: inBillion }),
        ...requestOptions,
      }) as Promise<string>
    },

    async getKaspadInfo(requestOptions: AnyOptions = {}) {
      return request('GET', '/info/kaspad', {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/info/kaspad'),
        ...requestOptions,
      })
    },

    async getFeeEstimate(requestOptions: AnyOptions = {}) {
      return request<FeeEstimate>('GET', '/info/fee-estimate', {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/info/fee-estimate'),
        ...requestOptions,
      })
    },

    async submitTransaction(tx: KaspaRestSubmitTxModel, requestOptions: AnyOptions = {}) {
      return request<KaspaRestSubmitTransactionResponse>('POST', '/transactions', {
        body: tx,
        query: { replaceByFee: requestOptions.replaceByFee ?? false },
        ...requestOptions,
        cache: false,
      })
    },

    async calculateTransactionMass(tx: KaspaRestSubmitTxModel, requestOptions: AnyOptions = {}) {
      return request<KaspaRestTxMass>('POST', '/transactions/mass', {
        body: tx,
        cacheKey: buildCacheKey(baseUrl.value, 'POST', '/transactions/mass', {}, tx),
        ...requestOptions,
      })
    },

    async getTransactionsCount(requestOptions: AnyOptions = {}) {
      return request('GET', '/transactions/count/', {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/transactions/count/'),
        ...requestOptions,
      })
    },

    async getTransactionsCountFor(dayOrMonth: string, requestOptions: AnyOptions = {}) {
      return request('GET', `/transactions/count/${encodeURIComponent(dayOrMonth)}`, {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', `/transactions/count/${dayOrMonth}`),
        ...requestOptions,
      })
    },

    async getVirtualChain(requestOptions: AnyOptions = {}) {
      return request<KaspaRestVcBlock[]>('GET', '/virtual-chain', {
        cacheKey: buildCacheKey(baseUrl.value, 'GET', '/virtual-chain'),
        ...requestOptions,
      })
    },
  }
}
