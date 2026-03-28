# Vue DevTools

VKAS 與 [Vue DevTools](https://devtools.vuejs.org) 整合，讓你即時檢視 WASM 狀態、RPC 狀態與區塊鏈事件，無需使用 console.log。

DevTools 整合在開發環境中自動啟用，在正式環境中停用。

## 檢視器面板

檢視器在 Vue DevTools 元件檢視器中新增一個 **Kaspa** 節點，顯示三個子節點：

### WASM

| 欄位 | 說明 |
|---|---|
| `status` | 目前的 `WasmStatus`：`idle` · `loading` · `ready` · `error` |

顏色標示：綠色 = `ready`，琥珀色 = `loading`，紅色 = `error`，灰色 = `idle`。

### RPC

| 欄位 | 說明 |
|---|---|
| `connectionState` | `disconnected` · `connecting` · `connected` · `reconnecting` · `error` |
| `url` | 已連線的節點 URL |
| `networkId` | 節點回報的網路（例如 `'mainnet'`） |
| `serverVersion` | 節點軟體版本（例如 `'0.14.1'`） |
| `isSynced` | 節點是否已完全同步 |
| `virtualDaaScore` | 即時 DAA 分數（每個區塊更新） |

### 網路

| 欄位 | 說明 |
|---|---|
| `networkId` | RPC 連線的活躍網路 ID |
| `daaScore` | 即時 DAA 分數 |

## 事件時間軸

DevTools **時間軸**包含一個 **Kaspa Events** 圖層（顏色：綠色）。所有 11 種 RPC 事件類型在收到時都會在此發布：

| 事件 | 日誌等級 |
|---|---|
| `block-added` | info |
| `virtual-daa-score-changed` | info |
| `utxos-changed` | info |
| `virtual-chain-changed` | info |
| `sink-blue-score-changed` | info |
| `new-block-template` | info |
| `connect` | info |
| `pruning-point-utxo-set-override` | info |
| `finality-conflict` | warning |
| `finality-conflict-resolved` | info |
| `disconnect` | error |

每個事件都會顯示摘要（區塊雜湊、DAA 分數、受影響的地址等），點擊後可查看完整 JSON 酬載。

## 啟用與停用

```ts
// Explicitly disable (useful in staging/production)
app.use(KaspaPlugin, {
  devtools: false,
})
```

DevTools 整合程式碼採用動態匯入。當 `devtools: false` 時，它會完全從正式環境套件中移除（搖樹優化）。

## 需求

- [Vue DevTools 瀏覽器擴充功能](https://devtools.vuejs.org/guide/installation) 或獨立 Electron 應用程式
- Vue DevTools API v8（隨 `@vue/devtools-api ^8.1.1` 附帶，已作為 VKAS 的依賴項包含在內）
