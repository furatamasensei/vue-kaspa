# はじめに

**VKAS** は [Kaspa](https://kaspa.org) ブロックチェーンと連携するためのリアクティブなコンポーザブルを提供する Vue 3 プラグインです。公式 WebAssembly SDK である [`@vue-kaspa/kaspa-wasm`](https://www.npmjs.com/package/@vue-kaspa/kaspa-wasm) をラップし、その機能を Vue 3 らしい API として公開します。

## 提供される機能

フルワークフローをカバーする 6 つのコンポーザブル:

| コンポーザブル | 目的 |
|---|---|
| [`useKaspa`](/ja/composables/use-kaspa) | WASM 初期化ライフサイクル |
| [`useRpc`](/ja/composables/use-rpc) | WebSocket RPC 接続、クエリ、イベント |
| [`useUtxo`](/ja/composables/use-utxo) | リアルタイム UTXO 追跡とリアクティブ残高 |
| [`useTransaction`](/ja/composables/use-transaction) | トランザクションの構築、署名、送信 |
| [`useCrypto`](/ja/composables/use-crypto) | キー生成、HD 導出、署名、単位変換 |
| [`useNetwork`](/ja/composables/use-network) | ネットワーク切り替え (mainnet、testnet など) |

## アーキテクチャ

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

内部シングルトンはモジュールレベルです — アプリケーション全体で **1 つの RPC 接続** と **1 つの WASM インスタンス** が共有されます。これは意図的な設計です。ブラウザのタブは Kaspa ノードへの WebSocket 接続を複数開くべきではありません。

## 公開 API

```ts
// Plugin
import { KaspaPlugin } from 'vue-kaspa'

// Composables
import { useKaspa, useRpc, useUtxo, useTransaction, useCrypto, useNetwork } from 'vue-kaspa'

// Error classes
import { KaspaError, KaspaNotReadyError, KaspaRpcError, KaspaWalletError, KaspaCryptoError } from 'vue-kaspa'

// Types (TypeScript)
import type { KaspaPluginOptions, KaspaNetwork, UtxoEntry, PendingTx, /* ... */ } from 'vue-kaspa'

// Constants
import { AVAILABLE_NETWORKS } from 'vue-kaspa'
```

## ピア依存関係

| パッケージ | バージョン |
|---|---|
| `vue` | `>=3.4.0` |
| `@vue-kaspa/kaspa-wasm` | `>=1.1.0` |
| `@nuxt/kit` | `^3.0.0` *(オプション — Nuxt モジュールを使用する場合のみ必要)* |

## 設計原則

- **シングルトン状態** — アプリにつき 1 つの RPC 接続と WASM インスタンス。10 個のコンポーネントから `useRpc()` を呼び出しても、すべて同じリアクティブな状態を返します。
- **遅延 WASM ロード** — `useKaspa().init()` が呼ばれる (または `autoConnect: true` でプラグインをインストールする) まで、WASM モジュールはロードされません。
- **自動クリーンアップ** — Vue コンポーネント内で使用するコンポーザブルは、`onUnmounted` 時にサブスクリプションとイベントハンドラーを自動的に解除します。
- **TypeScript ファースト** — すべてのコンポーザブルの戻り値型、オプション、データ構造はエクスポートされたインターフェースで完全に型付けされています。
- **ツリーシェイク可能** — DevTools 統合は動的インポートされ、`devtools: false` の場合はプロダクションバンドルに含まれません。
