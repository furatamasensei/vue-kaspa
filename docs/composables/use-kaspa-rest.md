# useKaspaRest

Typed wrapper around the official Kaspa REST API at `https://api.kaspa.org` or a self-hosted compatible server.

It includes a small in-memory cache for repeated queries and normalizes transaction responses with `senderAddresses` when the REST payload includes enough input data.

## Import

```ts
import { useKaspaRest } from 'vue-kaspa'
```

## Signature

```ts
function useKaspaRest(options?: KaspaRestOptions): UseKaspaRestReturn
```

## Options

```ts
interface KaspaRestOptions {
  baseUrl?: string
  staleTime?: number
  cacheTime?: number
  headers?: HeadersInit
  fetcher?: typeof fetch
}
```

## Return type

```ts
interface UseKaspaRestReturn {
  baseUrl: Readonly<Ref<string>>
  cacheSize: ComputedRef<number>
  clearCache(prefix?: string): void
  request<T>(method, path, options?): Promise<T>
  getTransaction(transactionId, options?): Promise<KaspaRestTransaction | null>
  searchTransactions(request, options?): Promise<KaspaRestTransaction[]>
  getFullTransactionsByAddress(address, options?): Promise<KaspaRestTransaction[]>
  getFullTransactionsByAddressPage(address, options?): Promise<KaspaRestTransaction[]>
  getTransactionAcceptance(transactionIds, options?): Promise<unknown>
  submitTransaction(tx, options?): Promise<unknown>
}
```

## Basic usage

```ts
import { useKaspaRest } from 'vue-kaspa'

const rest = useKaspaRest()

const tx = await rest.getTransaction('txid...')
const full = await rest.getFullTransactionsByAddress('kaspa:qr...')
const txs = await rest.getFullTransactionsByAddressPage('kaspa:qr...', { limit: 25 })
const utxos = await rest.getUtxosByAddress('kaspa:qr...')
const fee = await rest.getFeeEstimate()
```

## Txid lookup

The REST API can search by transaction id without a third-party indexer:

```ts
const tx = await rest.getTransaction('txid...', {
  resolvePreviousOutpoints: 'full',
})

console.log(tx?.senderAddresses)
```

If the response contains input addresses or resolved previous outpoints, `senderAddresses` is filled in automatically.

## Caching

The composable caches repeated identical requests in memory.

- `staleTime` controls when a cached result is considered fresh.
- `cacheTime` controls how long the entry stays in memory.
- Call `clearCache()` to drop the cache manually.

## Endpoint families

The wrapper currently covers:

- `GET /blocks`
- `GET /blocks/{hash}`
- `GET /blocks-from-bluescore`
- `GET /addresses/{kaspaAddress}/utxos`
- `POST /addresses/utxos`
- `GET /addresses/{kaspaAddress}/utxos/count`
- `POST /transactions/search`
- `POST /transactions/acceptance`
- `POST /transactions`
- `POST /transactions/mass`
- `GET /addresses/{kaspaAddress}/full-transactions`
- `GET /addresses/{kaspaAddress}/full-transactions-page`
- `GET /addresses/{kaspaAddress}/transactions-count`
- `GET /addresses/active/count/`
- `GET /addresses/active/count/{day_or_month}`
- `POST /addresses/balances`
- `GET /info/blockreward`
- `GET /info/halving`
- `GET /info/hashrate`
- `GET /info/hashrate/max`
- `GET /info/hashrate/history`
- `GET /info/hashrate/history/{day_or_month}`
- `GET /info/health`
- `GET /info/marketcap`
- `GET /info/virtual-chain-blue-score`
- `GET /info/blockdag`
- `GET /info/network`
- `GET /info/coinsupply`
- `GET /info/coinsupply/circulating`
- `GET /info/coinsupply/total`
- `GET /info/kaspad`
- `GET /info/fee-estimate`

For anything not yet wrapped, use `request()` directly.
