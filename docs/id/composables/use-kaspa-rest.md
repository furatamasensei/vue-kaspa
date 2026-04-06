# useKaspaRest

Pembungkus bertipe untuk Kaspa REST API resmi.

Gunakan composable ini ketika kamu butuh pembacaan bergaya explorer yang sulit atau tidak praktis lewat RPC langsung:
- mencari transaksi lewat txid
- mengambil riwayat alamat atau saldo
- memeriksa blok tanpa perlu mengelola langganan RPC sendiri
- bekerja dengan server Kaspa REST self-hosted yang memakai API client yang sama

Gunakan [`useRpc()`](/id/composables/use-rpc) jika kamu butuh state node live, subscription, event mempool, atau block template.

## Kapan dipakai

`useRpc()` cocok untuk interaksi node real-time. `useKaspaRest()` cocok untuk workflow baca-heavy karena indeks REST biasanya lebih cepat dan lebih mudah dipakai:
- pencarian txid mengembalikan payload transaksi bertipe
- bentuk respons mengikuti schema REST, jadi hasilnya lebih dapat diprediksi
- cache kecil di memori mengurangi permintaan berulang dari tree komponen
- composable mengikuti network yang sedang aktif kecuali kamu menimpa `baseUrl`

## Pemilihan network

Secara default composable memilih host REST berdasarkan network Kaspa yang aktif:
- `mainnet` -> `https://api.kaspa.org`
- `testnet-10` -> `https://api-tn10.kaspa.org`
- `testnet-12` -> `https://api-tn12.kaspa.org`

Jika kamu memakai `simnet`, `devnet`, atau server REST self-hosted, berikan `baseUrl` secara eksplisit.

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
  getTransactionById(transactionId, options?): Promise<KaspaRestTransaction | null>
  searchTransactions(request, options?): Promise<KaspaRestTransaction[]>
  getAddressBalance(address, options?): Promise<KaspaRestBalanceResponse>
  getAddressBalanceHistory(address, dayOrMonth, options?): Promise<KaspaRestAddressBalanceHistory[]>
  getAddressNames(options?): Promise<KaspaRestAddressName[]>
  getAddressName(address, options?): Promise<KaspaRestAddressName>
  getTopAddresses(options?): Promise<KaspaRestTopAddresses[]>
  getAddressTransactionCount(address, options?): Promise<KaspaRestTransactionCount>
  getFullTransactionsByAddress(address, options?): Promise<KaspaRestTransaction[]>
  getFullTransactionsByAddressPage(address, options?): Promise<KaspaRestTransaction[]>
  getUtxosByAddress(address, options?): Promise<KaspaRestUtxoResponse[]>
  getUtxosByAddresses(addresses, options?): Promise<KaspaRestUtxoResponse[]>
  getUtxoCountByAddress(address, options?): Promise<KaspaRestUtxoCountResponse>
  getBalancesByAddresses(addresses, options?): Promise<KaspaRestBalancesByAddressEntry[]>
  getBlock(hash, includeTransactions?): Promise<KaspaRestBlock>
  getBlocks(options?): Promise<KaspaRestBlockResponse>
  getBlocksFromBlueScore(options): Promise<KaspaRestBlock[]>
  getBlockDag(options?): Promise<KaspaRestBlockdagResponse>
  getNetwork(options?): Promise<KaspaRestBlockdagResponse>
  getCoinSupply(options?): Promise<KaspaRestCoinSupplyResponse>
  getBlockReward(options?): Promise<KaspaRestBlockRewardResponse>
  getHalving(field?, options?): Promise<KaspaRestHalvingResponse>
  getHashrate(options?): Promise<KaspaRestHashrateResponse>
  getMaxHashrate(options?): Promise<KaspaRestMaxHashrateResponse>
  getHashrateHistory(options?): Promise<KaspaRestHashrateHistoryResponse[]>
  getHashrateHistoryFor(dayOrMonth, resolution?, options?): Promise<KaspaRestHashrateHistoryResponse[]>
  getHealth(options?): Promise<KaspaRestHealthResponse>
  getKaspadInfo(options?): Promise<KaspaRestKaspadInfoResponse>
  getMarketcap(options?): Promise<KaspaRestMarketCapResponse | string>
  getVirtualSelectedParentBlueScore(options?): Promise<KaspaRestBlueScoreResponse>
  getFeeEstimate(options?): Promise<FeeEstimate>
  getTransactionAcceptance(transactionIds, options?): Promise<KaspaRestTransactionAcceptance[]>
  getTransactionsCount(options?): Promise<KaspaRestTransactionCountResponse>
  getTransactionsCountFor(dayOrMonth, options?): Promise<KaspaRestTransactionCountResponse[]>
  getVirtualChain(options?): Promise<KaspaRestVcBlock[]>
  submitTransaction(tx, options?): Promise<KaspaRestSubmitTransactionResponse>
  calculateTransactionMass(tx, options?): Promise<KaspaRestTxMass>
}
```

## Basic usage

```ts
import { useKaspaRest } from 'vue-kaspa'

const rest = useKaspaRest()

const tx = await rest.getTransaction('txid...')
const fullTx = await rest.getTransactionById('txid...')
const history = await rest.getFullTransactionsByAddress('kaspa:qr...')
const page = await rest.getFullTransactionsByAddressPage('kaspa:qr...', { limit: 25 })
const utxos = await rest.getUtxosByAddress('kaspa:qr...')
const fee = await rest.getFeeEstimate()
```

## Txid lookup

`getTransaction()` is the convenience path. It searches by transaction id and returns `null` if the tx is missing.

`getTransactionById()` uses the dedicated REST endpoint for direct lookup.

```ts
const tx = await rest.getTransactionById('txid...', {
  resolvePreviousOutpoints: 'full',
})

console.log(tx?.transactionId ?? tx?.transaction_id)
console.log(tx?.senderAddresses)
```

If the payload contains resolved input addresses, `senderAddresses` is filled in automatically. When the payload includes enough script data, the composable can derive sender addresses with `kaspa-wasm` as a fallback.

## Caching

The composable caches repeated identical requests in memory.

- `staleTime` controls when a cached result is considered fresh.
- `cacheTime` controls how long the entry stays in memory.
- Call `clearCache()` to drop cached entries manually.

## Experimental endpoints

These REST routes are marked experimental in the official schema and may change without notice:
- `GET /addresses/{kaspaAddress}/balance/{day_or_month}`
- `GET /addresses/distribution`
- `GET /addresses/top`
- `GET /addresses/active/count/`
- `GET /addresses/active/count/{day_or_month}`
- `GET /transactions/count/`
- `GET /transactions/count/{day_or_month}`
- `GET /virtual-chain`

They are still wrapped here for convenience, but treat them as unstable.

## Endpoint families

The wrapper covers the main official REST surface:

- `GET /addresses/{kaspaAddress}/balance`
- `GET /addresses/{kaspaAddress}/balance/{day_or_month}` `experimental`
- `GET /addresses/{kaspaAddress}/utxos`
- `POST /addresses/utxos`
- `GET /addresses/{kaspaAddress}/utxos/count`
- `GET /addresses/{kaspaAddress}/name`
- `GET /addresses/names`
- `GET /addresses/top` `experimental`
- `POST /addresses/active`
- `GET /addresses/active/count/` `experimental`
- `GET /addresses/active/count/{day_or_month}` `experimental`
- `POST /addresses/balances`
- `GET /addresses/{kaspaAddress}/full-transactions`
- `GET /addresses/{kaspaAddress}/full-transactions-page`
- `GET /addresses/{kaspaAddress}/transactions-count`
- `GET /addresses/distribution` `experimental`
- `GET /blocks`
- `GET /blocks/{blockId}`
- `GET /blocks-from-bluescore`
- `GET /info/blockdag`
- `GET /info/network`
- `GET /info/blockreward`
- `GET /info/coinsupply`
- `GET /info/coinsupply/circulating`
- `GET /info/coinsupply/total`
- `GET /info/fee-estimate`
- `GET /info/halving`
- `GET /info/hashrate`
- `GET /info/hashrate/history`
- `GET /info/hashrate/history/{day_or_month}`
- `GET /info/hashrate/max`
- `GET /info/health`
- `GET /info/kaspad`
- `GET /info/marketcap`
- `GET /info/price`
- `GET /info/virtual-chain-blue-score`
- `POST /transactions`
- `POST /transactions/acceptance`
- `POST /transactions/mass`
- `POST /transactions/search`
- `GET /transactions/{transaction_id}`
- `GET /transactions/count/` `experimental`
- `GET /transactions/count/{day_or_month}` `experimental`
- `GET /virtual-chain` `experimental`

For anything not wrapped yet, use `request()` directly.
