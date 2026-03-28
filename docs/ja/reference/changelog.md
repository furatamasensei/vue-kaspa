# 変更履歴

## v0.1.2

### バグ修正

- **WASM クラス名の保持** — `@vue-kaspa/kaspa-wasm` がミニファイされた本番ビルドで正しく動作するようになりました。wasm-bindgen は実行時に `obj.constructor.name` を確認して渡された JS オブジェクトを検証します。標準的なバンドラーのミニファイは 76 個すべての WASM バックエンドクラスを `class e` にリネームし、`"object constructor 'e' does not match expected class 'Resolver'"` エラーを引き起こしていました。ベンダーパッケージは各クラス定義の後に `Object.defineProperty(ClassName, 'name', { value: 'ClassName' })` を呼び出すようになりました — 文字列リテラルはミニファイ後も残り、クラスのリネーム後に正しい名前を復元します。ユーザーの設定変更は不要です。

---

## v0.1.1

### バグ修正

- **一元化された WASM シングルトン** — すべての内部モジュールが `globalThis` に格納された単一の `loadKaspa()` / `getKaspa()` ヘルパーを通じて `@vue-kaspa/kaspa-wasm` にアクセスするようになりました。これにより、バンドラーが kaspa-wasm バインディングを複数のチャンクに出力した場合のクラス同一性の不一致を防ぎます。
- **パッケージの名前変更** — 基盤となる WASM バインディングパッケージが `@vue-kaspa/kaspa-wasm` (スコープ付き、モノレポに一致) に名前変更されました。

---

## v0.1.0

初回リリース。

### 機能

**Vue プラグイン + Nuxt モジュール**
- 完全な `KaspaPluginOptions` 設定を備えた Vue 3 向け `KaspaPlugin`
- 自動インポートと SSR セーフティを備えた Nuxt 3 モジュール (`vue-kaspa/nuxt`)
- Vue DevTools 統合 — インスペクターパネルとイベントタイムライン

**コンポーザブル**
- `useKaspa` — ステータストラッキングを備えた WASM 初期化ライフサイクル
- `useRpc` — WebSocket RPC 接続、12 のクエリメソッド、イベント購読
- `useUtxo` — リアルタイム UTXO 追跡、リアクティブ残高、アンマウント時の自動クリーンアップ
- `useTransaction` — UTXO コンパウンディングサポートを備えた `estimate()`、`create()`、`send()`
- `useCrypto` — BIP-39 ニーモニック、BIP-32 HD 導出、署名、単位変換
- `useNetwork` — 自動再接続によるネットワーク切り替え

**対応ネットワーク**
- `mainnet`、`testnet-10`、`testnet-11`、`simnet`、`devnet`

**TypeScript**
- 完全な型カバレッジ: エクスポートされたインターフェースとユニオン型 23 種
- strict モード互換
- コンポーザブルの戻り値型インターフェース (`UseRpcReturn`、`UseUtxoReturn` など)

**エラーハンドリング**
- `.cause` チェーンを備えた `KaspaError` ベースクラス
- `KaspaNotReadyError`、`KaspaRpcError`、`KaspaWalletError`、`KaspaCryptoError`
