# 更新日誌

## v0.1.2

### 錯誤修正

- **WASM 類別名稱保留** — `@vue-kaspa/kaspa-wasm` 現在可在壓縮的正式環境建置中正確運作。wasm-bindgen 在執行時透過檢查 `obj.constructor.name` 來驗證傳入的 JS 物件；標準打包工具的壓縮會將所有 76 個 WASM 支援的類別重新命名為 `class e`，導致出現 `"object constructor 'e' does not match expected class 'Resolver'"` 的錯誤。供應商套件現在在每個類別定義之後呼叫 `Object.defineProperty(ClassName, 'name', { value: 'ClassName' })`——字串字面值在壓縮後仍然保留，並在類別重新命名後恢復正確的名稱。無需使用者進行任何設定。

---

## v0.1.1

### 錯誤修正

- **集中化 WASM 單例** — 所有內部模組現在透過儲存在 `globalThis` 上的單一 `loadKaspa()` / `getKaspa()` 輔助函式存取 `@vue-kaspa/kaspa-wasm`。這防止了打包工具將 kaspa-wasm 綁定輸出到多個 chunk 時出現的類別身分不匹配問題。
- **套件重新命名** — 底層 WASM 綁定套件重新命名為 `@vue-kaspa/kaspa-wasm`（已加入作用域，與 monorepo 相符）。

---

## v0.1.0

初始版本。

### 功能特色

**Vue 插件 + Nuxt 模組**
- 具備完整 `VueKaspaOptions` 設定的 Vue 3 `VueKaspa`
- 具備自動匯入與 SSR 安全性的 Nuxt 3 模組（`vue-kaspa/nuxt`）
- Vue DevTools 整合——檢視器面板與事件時間軸

**可組合函式**
- `useKaspa` — 具備狀態追蹤的 WASM 初始化生命週期
- `useRpc` — WebSocket RPC 連線、12 種查詢方法、事件訂閱
- `useUtxo` — 即時 UTXO 追蹤、響應式餘額、卸載時自動清理
- `useTransaction` — 支援 UTXO 整合的 `estimate()`、`create()`、`send()`
- `useCrypto` — BIP-39 助記詞、BIP-32 HD 衍生、簽署、單位換算
- `useNetwork` — 具備自動重連的網路切換

**支援的網路**
- `mainnet`、`testnet-10`、`testnet-11`、`simnet`、`devnet`

**TypeScript**
- 完整型別覆蓋：23 個匯出介面與聯集型別
- 嚴格模式相容
- 可組合函式回傳型別介面（`UseRpcReturn`、`UseUtxoReturn` 等）

**錯誤處理**
- 帶有 `.cause` 鏈接的 `KaspaError` 基礎類別
- `KaspaNotReadyError`、`KaspaRpcError`、`KaspaWalletError`、`KaspaCryptoError`
