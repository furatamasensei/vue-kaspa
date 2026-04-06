# useKaspaRest

Kaspa の公式 REST API を型付きで扱うためのラッパーです。

ライブ RPC では扱いにくい読み取り用途で使います:
- txid からトランザクションを検索する
- アドレス履歴や残高を取得する
- 自前の RPC 購読なしでブロックを確認する
- 同じ API で self-hosted の Kaspa REST サーバーを扱う

ライブのノード状態、購読、mempool イベント、ブロックテンプレートが必要なら [`useRpc()`](/ja/composables/use-rpc) を使ってください。

## 使いどころ

`useRpc()` はリアルタイムのノード操作向けです。`useKaspaRest()` は、REST インデックスの方が速くて扱いやすい読み取りワークフロー向けです:
- txid 検索が型付きのトランザクションを返す
- レスポンス形状が REST スキーマと一致する
- 小さなメモリキャッシュで重複リクエストを減らせる
- `baseUrl` を上書きしない限り、現在のネットワークを追従する

## ネットワーク選択

デフォルトでは、現在の Kaspa ネットワークに応じて REST ホストを選びます:
- `mainnet` -> `https://api.kaspa.org`
- `testnet-10` -> `https://api-tn10.kaspa.org`
- `testnet-12` -> `https://api-tn12.kaspa.org`

`simnet`、`devnet`、または self-hosted REST サーバーを使う場合は `baseUrl` を明示してください。

## インポート

```ts
import { useKaspaRest } from 'vue-kaspa'
```

## シグネチャ

```ts
function useKaspaRest(options?: KaspaRestOptions): UseKaspaRestReturn
```

## オプション

```ts
interface KaspaRestOptions {
  baseUrl?: string
  staleTime?: number
  cacheTime?: number
  headers?: HeadersInit
  fetcher?: typeof fetch
}
```

## 戻り値の型

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

## 基本的な使い方

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

## Txid 検索

`getTransaction()` は手軽に使える検索パスです。transaction id で探し、見つからない場合は `null` を返します。

`getTransactionById()` は、直接検索用の専用 REST エンドポイントを使います。

```ts
const tx = await rest.getTransactionById('txid...', {
  resolvePreviousOutpoints: 'full',
})

console.log(tx?.transactionId ?? tx?.transaction_id)
console.log(tx?.senderAddresses)
```

ペイロードに解決済みの入力アドレスが含まれている場合、`senderAddresses` は自動で埋まります。ペイロードに十分な script data が含まれている場合は、フォールバックとして `kaspa-wasm` から送信元アドレスを導出できます。

## キャッシュ

この composable は、同一の繰り返しリクエストをメモリ上にキャッシュします。

- `staleTime` は、キャッシュ済み結果をいつ新鮮とみなすかを決めます。
- `cacheTime` は、エントリをメモリに保持する時間を決めます。
- `clearCache()` を呼ぶと、キャッシュ済みエントリを手動で削除できます。

## 実験的なエンドポイント

以下の REST ルートは公式スキーマ上で experimental 扱いになっており、予告なく変更される可能性があります:
- `GET /addresses/{kaspaAddress}/balance/{day_or_month}`
- `GET /addresses/distribution`
- `GET /addresses/top`
- `GET /addresses/active/count/`
- `GET /addresses/active/count/{day_or_month}`
- `GET /transactions/count/`
- `GET /transactions/count/{day_or_month}`
- `GET /virtual-chain`

利便性のためにこのラッパーで公開していますが、安定版としては扱わないでください。

## エンドポイント群

このラッパーは公式 REST の主要な範囲をカバーしています:

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

まだラップされていないものは、`request()` を直接使ってください。
