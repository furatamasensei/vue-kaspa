# useKaspaRest

Kaspa 官方 REST API 的型別化包裝器。

適合用在 RPC 即時連線不方便處理的查詢情境:
- 透過 txid 查找交易
- 取得地址歷史與餘額
- 不必維護自己的 RPC 訂閱就能檢視區塊
- 用同一套 client API 存取自架的 Kaspa REST 伺服器

如果你需要即時節點狀態、訂閱、mempool 事件或區塊模板，請改用 [`useRpc()`](/zh-TW/composables/use-rpc)。

## 使用時機

`useRpc()` 適合即時節點操作。`useKaspaRest()` 適合偏向讀取的工作流程，因為 REST 索引通常更快也更容易使用:
- txid 查詢會回傳有型別的交易資料
- 回應結構與 REST schema 對齊，結果更可預期
- 內建的小型記憶體快取可減少重複請求
- 除非你覆寫 `baseUrl`，否則會跟隨目前的網路

## 網路選擇

預設會依照目前的 Kaspa 網路自動選擇 REST host:
- `mainnet` -> `https://api.kaspa.org`
- `testnet-10` -> `https://api-tn10.kaspa.org`
- `testnet-12` -> `https://api-tn12.kaspa.org`

如果你使用 `simnet`、`devnet` 或自架 REST 伺服器，請明確提供 `baseUrl`。

## 匯入

```ts
import { useKaspaRest } from 'vue-kaspa'
```

## 簽章

```ts
function useKaspaRest(options?: KaspaRestOptions): UseKaspaRestReturn
```

## 選項

```ts
interface KaspaRestOptions {
  baseUrl?: string
  staleTime?: number
  cacheTime?: number
  headers?: HeadersInit
  fetcher?: typeof fetch
}
```

## 回傳型別

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

## 基本用法

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

## Txid 查詢

`getTransaction()` 是方便使用的查詢路徑。它會依 transaction id 搜尋，若交易不存在則回傳 `null`。

`getTransactionById()` 則會使用專用的 REST endpoint 進行直接查詢。

```ts
const tx = await rest.getTransactionById('txid...', {
  resolvePreviousOutpoints: 'full',
})

console.log(tx?.transactionId ?? tx?.transaction_id)
console.log(tx?.senderAddresses)
```

如果 payload 已包含已解析的輸入地址，`senderAddresses` 會自動填入。當 payload 含有足夠的 script data 時，這個 composable 也可以將 `kaspa-wasm` 作為 fallback 來推導 sender addresses。

## 快取

這個 composable 會把重複且相同的請求快取在記憶體中。

- `staleTime` 用來決定快取結果何時仍被視為新鮮。
- `cacheTime` 用來決定項目在記憶體中保留多久。
- 呼叫 `clearCache()` 可以手動清除快取項目。

## 實驗性端點

以下 REST 路由在官方 schema 中標記為 experimental，可能在未通知的情況下變更:
- `GET /addresses/{kaspaAddress}/balance/{day_or_month}`
- `GET /addresses/distribution`
- `GET /addresses/top`
- `GET /addresses/active/count/`
- `GET /addresses/active/count/{day_or_month}`
- `GET /transactions/count/`
- `GET /transactions/count/{day_or_month}`
- `GET /virtual-chain`

為了方便仍然有包裝，但請把它們視為不穩定功能。

## 端點類別

這個 wrapper 涵蓋官方 REST 的主要範圍:

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

尚未包裝的端點，請直接使用 `request()`。
