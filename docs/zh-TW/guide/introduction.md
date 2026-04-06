# 簡介

**Vue Kaspa** 是一個 Vue 3 插件，提供響應式可組合函式以與 [Kaspa](https://kaspa.org) 區塊鏈互動。它封裝了 [`@vue-kaspa/kaspa-wasm`](https://www.npmjs.com/package/@vue-kaspa/kaspa-wasm)——官方 WebAssembly SDK——並透過慣用的 Vue 3 API 公開其功能。

## 你將獲得

十一個可組合函式加上一個整合 facade，涵蓋完整工作流程：

| 可組合函式 | 用途 |
|---|---|
| [`useKaspa`](/composables/use-kaspa) | WASM 初始化生命週期 |
| [`useRpc`](/composables/use-rpc) | WebSocket RPC 連線、查詢與事件 |
| [`useKaspaRest`](/composables/use-kaspa-rest) | 透過官方 REST API 查詢 txid、餘額、地址歷史與探索器資料 |
| [`useUtxo`](/composables/use-utxo) | 即時 UTXO 追蹤與響應式餘額 |
| [`useTransaction`](/composables/use-transaction) | 交易建構、簽署與提交 |
| [`useTransactionListener`](/composables/use-transaction-listener) | 追蹤已接受的交易 ID 與送出方地址 |
| [`useBlockListener`](/composables/use-block-listener) | 監聽新增的區塊 |
| [`useCrypto`](/composables/use-crypto) | 金鑰生成、HD 衍生、簽署、單位換算 |
| [`useNetwork`](/composables/use-network) | 網路切換（mainnet、testnet 等） |
| [`useWallet`](/composables/use-wallet) | 連線到瀏覽器錢包擴充套件（KasWare、Kastle） |
| [`useVueKaspa`](/composables/use-vue-kaspa) | 供應用程式使用的整合入口 |

## 架構

```
┌─────────────────────────────────────────────────────┐
│  Your Vue components / Nuxt pages                   │
│  useRpc()  useUtxo()  useTransaction()  useCrypto() │
└──────────────────────┬──────────────────────────────┘
                       │ Vue reactivity
┌──────────────────────▼──────────────────────────────┐
│  Internal singletons (shared across all components) │
│  RpcManager · WasmLoader · EventBridge              │
└──────────────────────┬──────────────────────────────┘
                       │ WASM calls
┌──────────────────────▼──────────────────────────────┐
│  @vue-kaspa/kaspa-wasm (WebAssembly)                           │
│  RpcClient · PrivateKey · XPrv · createTransactions │
└─────────────────────────────────────────────────────┘
```

內部單例為模組層級——每個應用程式只有**一個 RPC 連線**與**一個 WASM 實例**，在所有可組合函式實例之間共享。這是刻意設計的：一個瀏覽器分頁不應對 Kaspa 節點開啟多個 WebSocket 連線。

## 公開 API 介面

```ts
// Plugin
import { VueKaspa } from 'vue-kaspa'

// Composables
import { useKaspa, useRpc, useKaspaRest, useUtxo, useTransaction, useTransactionListener, useBlockListener, useCrypto, useNetwork, useWallet, useVueKaspa } from 'vue-kaspa'

// Error classes
import { KaspaError, KaspaNotReadyError, KaspaRpcError, KaspaWalletError, KaspaCryptoError } from 'vue-kaspa'

// Types (TypeScript)
import type { VueKaspaOptions, KaspaNetwork, UtxoEntry, PendingTx, /* ... */ } from 'vue-kaspa'

// Constants
import { AVAILABLE_NETWORKS } from 'vue-kaspa'
```

## 同儕依賴

| 套件 | 版本 |
|---|---|
| `vue` | `>=3.4.0` |
| `@vue-kaspa/kaspa-wasm` | `>=1.1.0` |
| `@nuxt/kit` | `^3.0.0` *(選用——僅 Nuxt 模組需要)* |

## 設計原則

- **單例狀態** — 每個應用程式只有一個 RPC 連線與 WASM 實例。從 10 個元件呼叫 `useRpc()` 都會回傳相同的響應式狀態。
- **延遲載入 WASM** — WASM 模組在呼叫 `useKaspa().init()` 之前不會載入（或在插件安裝時設定 `autoConnect: true` 則自動載入）。
- **自動清理** — 在 Vue 元件內使用的可組合函式會在 `onUnmounted` 時自動清理訂閱與事件處理器。
- **TypeScript 優先** — 所有可組合函式的回傳型別、選項與資料結構均透過匯出介面完整定型。
- **可搖樹優化** — DevTools 整合採用動態匯入，當 `devtools: false` 時不會出現在正式環境套件中。
