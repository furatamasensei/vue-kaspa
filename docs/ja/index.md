---
layout: home
hero:
  name: Vue Kaspa
  text: 最速チェーンと優れた開発体験
  tagline: Kaspa は速い！でも Vue で動かすのは悪夢でした。このプラグインがそれを簡単にします。
  image:
    src: /logo.png
    alt: Vue Kaspa
  actions:
    - theme: brand
      text: はじめる
      link: /ja/guide/introduction
    - theme: brand
      text: CLI を試す
      link: /ja/guide/installation#quick-setup
    - theme: alt
      text: コンポーザブル
      link: /ja/composables/use-kaspa
features:
  - icon: 🚀
    title: CLI スキャフォールディング
    details: npx vue-kaspa-cli を実行するだけで、WASM・CORS ヘッダー・KaspaStatus コンポーネントがすべて設定済みの Vue 3 または Nuxt 4 スターターを即座に作成できます。
  - icon: ⚡
    title: デフォルトでリアクティブ
    details: WASM のステータス、接続状態、UTXO、残高はすべて Vue のリアクティブ ref です — 手動での配線は不要です。
  - icon: 🧩
    title: Vue プラグイン + Nuxt モジュール
    details: app.use(VueKaspa) で一度インストールするか、nuxt.config.ts に追加するだけ。Nuxt ではすべてのコンポーザブルが自動インポートされます。
  - icon: 🔑
    title: フルウォレットツールキット
    details: BIP-39 ニーモニック生成、BIP-32 HD キー導出、アドレスユーティリティ、メッセージ署名、単位変換を完備。
  - icon: 🛠
    title: 開発者体験
    details: TypeScript ファーストで厳格な型付き、Vue DevTools インスペクターとイベントタイムライン、構造化されたエラー階層を提供します。
  - icon: 🛰
    title: REST インデックス
    details: 公式 Kaspa REST API を使って、txid 検索、残高、アドレス履歴、ブロック確認を型安全に扱えます。
---
