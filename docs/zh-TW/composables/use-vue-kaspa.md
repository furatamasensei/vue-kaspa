# useVueKaspa

`useVueKaspa()` 是給應用程式使用的整合入口，會把各個 composable 包成一個有型別的物件，方便從單一 import 開始使用。

## 匯入

```ts
import { useVueKaspa } from 'vue-kaspa'
```

## 簽章

```ts
function useVueKaspa(): UseVueKaspaReturn
```

## 回傳結構

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

## 什麼時候使用

當你想要用一個入口統一存取所有核心功能時，就很適合用它。若只需要單一子系統，直接使用個別 composable 會更清楚。
