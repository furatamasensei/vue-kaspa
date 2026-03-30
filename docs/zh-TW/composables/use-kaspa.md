# useKaspa

控制 `@vue-kaspa/kaspa-wasm` WebAssembly 模組的生命週期。在執行任何 RPC 連線或加密操作之前，必須先初始化 WASM 模組。

## 匯入

```ts
import { useKaspa } from 'vue-kaspa'
```

## 回傳型別

```ts
interface UseKaspaReturn {
  wasmStatus: Readonly<Ref<WasmStatus>>
  wasmError: Readonly<Ref<Error | null>>
  isReady: ComputedRef<boolean>
  init(): Promise<void>
  reset(): void
}
```

## 屬性

| 屬性 | 型別 | 說明 |
|---|---|---|
| `wasmStatus` | `Readonly<Ref<WasmStatus>>` | 目前的 WASM 生命週期狀態 |
| `wasmError` | `Readonly<Ref<Error \| null>>` | `wasmStatus` 為 `'error'` 時的錯誤物件 |
| `isReady` | `ComputedRef<boolean>` | 簡寫：`wasmStatus.value === 'ready'` |

## 方法

| 方法 | 說明 |
|---|---|
| `init()` | 載入 WASM 模組。可安全多次呼叫——具有冪等性。 |
| `reset()` | 重置為 `'idle'`。主要用於測試。 |

## 狀態生命週期

```
idle ──► loading ──► ready
              │
              └──► error (call init() again to retry)
```

| 狀態 | 含義 |
|---|---|
| `'idle'` | 尚未開始 |
| `'loading'` | WASM 模組正在擷取與編譯中 |
| `'ready'` | WASM 已初始化完成 |
| `'error'` | 初始化失敗——請查看 `wasmError.value` |

## 單例

WASM 狀態為**模組層級**——在所有元件實例之間共享。從多個元件同時呼叫 `init()` 是安全的：所有呼叫共享同一個初始化 Promise 並一起解析。

## 基本用法

```vue
<script setup lang="ts">
import { useKaspa } from 'vue-kaspa'
import { onMounted } from 'vue'

const kaspa = useKaspa()

onMounted(async () => {
  await kaspa.init()
  // kaspa.wasmStatus.value === 'ready'
})
</script>

<template>
  <div>
    <span v-if="kaspa.isReady.value">WASM ready</span>
    <span v-else-if="kaspa.wasmStatus.value === 'loading'">Loading WASM...</span>
    <span v-else-if="kaspa.wasmStatus.value === 'error'" class="error">
      Error: {{ kaspa.wasmError.value?.message }}
    </span>
  </div>
</template>
```

## 使用 autoConnect

當插件以 `autoConnect: true`（預設值）安裝時，WASM 會自動初始化。你不需要手動呼叫 `init()`。

```ts
app.use(VueKaspa, { autoConnect: true })
// WASM loads on plugin install — wasmStatus becomes 'ready' before first component mount
```

## 錯誤恢復

```ts
const kaspa = useKaspa()

try {
  await kaspa.init()
} catch {
  // wasmStatus.value is now 'error'
  // wasmError.value contains the reason

  // Retry after fixing the issue (e.g., re-fetching the WASM binary):
  await kaspa.init()
}
```

## 崩潰處理器

崩潰處理器透過插件選項 `panicHook` 設定。它控制 WASM 模組遇到無法恢復的錯誤時的行為：

| 值 | 行為 |
|---|---|
| `'console'` | 將崩潰訊息記錄到瀏覽器主控台（預設值） |
| `'browser'` | 顯示帶有崩潰訊息的瀏覽器 `alert()` 對話框 |
| `false` | 不安裝崩潰處理器 |
