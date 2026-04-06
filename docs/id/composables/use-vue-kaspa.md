# useVueKaspa

`useVueKaspa()` adalah facade terpadu untuk kode aplikasi. Ia menggabungkan composable yang ada ke dalam satu object bertipe sehingga kamu bisa mulai dari satu import lalu masuk ke subsystem yang dibutuhkan.

## Import

```ts
import { useVueKaspa } from 'vue-kaspa'
```

## Tanda tangan

```ts
function useVueKaspa(): UseVueKaspaReturn
```

## Bentuk return

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

## Kapan dipakai

Gunakan saat kamu ingin satu entrypoint sederhana untuk aplikasi. Kalau hanya butuh satu subsystem, composable individual tetap lebih tepat.
