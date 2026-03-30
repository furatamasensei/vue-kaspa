# useKaspa

`@vue-kaspa/kaspa-wasm` WebAssembly モジュールのライフサイクルを管理します。RPC 接続や暗号操作を実行する前に WASM モジュールを初期化する必要があります。

## インポート

```ts
import { useKaspa } from 'vue-kaspa'
```

## 戻り値の型

```ts
interface UseKaspaReturn {
  wasmStatus: Readonly<Ref<WasmStatus>>
  wasmError: Readonly<Ref<Error | null>>
  isReady: ComputedRef<boolean>
  init(): Promise<void>
  reset(): void
}
```

## プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `wasmStatus` | `Readonly<Ref<WasmStatus>>` | 現在の WASM ライフサイクル状態 |
| `wasmError` | `Readonly<Ref<Error \| null>>` | `wasmStatus` が `'error'` の場合のエラーオブジェクト |
| `isReady` | `ComputedRef<boolean>` | 短縮形: `wasmStatus.value === 'ready'` |

## メソッド

| メソッド | 説明 |
|---|---|
| `init()` | WASM モジュールをロードします。複数回呼び出しても安全 — べき等です。 |
| `reset()` | `'idle'` にリセットします。主にテスト用。 |

## ステータスのライフサイクル

```
idle ──► loading ──► ready
              │
              └──► error (call init() again to retry)
```

| ステータス | 意味 |
|---|---|
| `'idle'` | 未開始 |
| `'loading'` | WASM モジュールをフェッチ・コンパイル中 |
| `'ready'` | WASM 初期化完了、使用可能 |
| `'error'` | 初期化失敗 — `wasmError.value` を確認してください |

## シングルトン

WASM の状態は**モジュールレベル** — すべてのコンポーネントインスタンスで共有されます。複数のコンポーネントから同時に `init()` を呼び出しても安全です: すべての呼び出しが同じ初期化 Promise を共有し、一緒に解決されます。

## 基本的な使い方

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

## autoConnect との組み合わせ

プラグインが `autoConnect: true` (デフォルト) でインストールされている場合、WASM は自動的に初期化されます。手動で `init()` を呼び出す必要はありません。

```ts
app.use(VueKaspa, { autoConnect: true })
// WASM loads on plugin install — wasmStatus becomes 'ready' before first component mount
```

## エラーリカバリー

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

## パニックフック

パニックフックはプラグインオプションの `panicHook` で設定します。WASM モジュールが回復不能なエラーに遭遇した場合の動作を制御します:

| 値 | 動作 |
|---|---|
| `'console'` | パニックメッセージをブラウザコンソールに記録 (デフォルト) |
| `'browser'` | パニックメッセージを含むブラウザの `alert()` ダイアログを表示 |
| `false` | パニックハンドラーをインストールしない |
