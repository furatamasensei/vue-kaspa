# useVueKaspa

`useVueKaspa()` はアプリ用の統合ファサードです。各コンポーザブルを 1 つの型付きオブジェクトにまとめ、単一の import から必要な機能にアクセスできます。

## Import

```ts
import { useVueKaspa } from 'vue-kaspa'
```

## Signature

```ts
function useVueKaspa(): UseVueKaspaReturn
```

## Return shape

```ts
const vueKaspa = useVueKaspa()

vueKaspa.kaspa
vueKaspa.rpc
vueKaspa.rest
vueKaspa.utxo
vueKaspa.transaction
vueKaspa.crypto
vueKaspa.network
vueKaspa.wallet
```

## 使いどころ

アプリの初期エントリを 1 つにまとめたいときに使います。個別の composable が必要ない場合でも、探索用の入り口として便利です。
