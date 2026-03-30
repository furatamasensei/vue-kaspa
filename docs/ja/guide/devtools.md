# Vue DevTools

Vue Kaspa は [Vue DevTools](https://devtools.vuejs.org) と統合し、WASM のステータス、RPC の状態、ブロックチェーンイベントをリアルタイムで確認できます — console.log なしで。

DevTools 統合は開発環境では自動的に有効化され、本番環境では無効化されます。

## インスペクターパネル

インスペクターは Vue DevTools のコンポーネントインスペクターに **Kaspa** ノードを追加します。3 つのサブノードが表示されます:

### WASM

| フィールド | 説明 |
|---|---|
| `status` | 現在の `WasmStatus`: `idle` · `loading` · `ready` · `error` |

カラーコード: 緑 = `ready`、黄 = `loading`、赤 = `error`、グレー = `idle`。

### RPC

| フィールド | 説明 |
|---|---|
| `connectionState` | `disconnected` · `connecting` · `connected` · `reconnecting` · `error` |
| `url` | 接続中のノード URL |
| `networkId` | ノードが報告するネットワーク (例: `'mainnet'`) |
| `serverVersion` | ノードソフトウェアのバージョン (例: `'0.14.1'`) |
| `isSynced` | ノードが完全に同期されているか |
| `virtualDaaScore` | ライブ DAA スコア (ブロックごとに更新) |

### Network

| フィールド | 説明 |
|---|---|
| `networkId` | RPC 接続からのアクティブなネットワーク ID |
| `daaScore` | ライブ DAA スコア |

## イベントタイムライン

DevTools の **タイムライン** には **Kaspa Events** レイヤー (色: 緑) が含まれます。11 種類すべての RPC イベントタイプが受信されるたびにここに表示されます:

| イベント | ログレベル |
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

各イベントにはサマリー (ブロックハッシュ、DAA スコア、影響を受けるアドレスなど) が表示され、クリックすると完全な JSON ペイロードを確認できます。

## 有効化と無効化

```ts
// Explicitly disable (useful in staging/production)
app.use(VueKaspa, {
  devtools: false,
})
```

DevTools 統合のコードは動的インポートされます。`devtools: false` の場合、プロダクションバンドルから完全に除外されます (ツリーシェイク)。

## 要件

- [Vue DevTools ブラウザ拡張機能](https://devtools.vuejs.org/guide/installation) またはスタンドアロンの Electron アプリ
- Vue DevTools API v8 (Vue Kaspa の依存関係として含まれる `@vue/devtools-api ^8.1.1` にバンドル済み)
