# useCrypto

Utilitas kriptografi murni: pembuatan mnemonic, derivasi kunci HD, operasi alamat, penandatanganan pesan, dan konversi unit.

Semua metode bersifat sinkron dan mengembalikan nilai biasa — tidak ada reactive ref.

## Import

```ts
import { useCrypto } from 'vue-kaspa'
```

## Referensi metode

| Metode | Kembalian | Deskripsi |
|---|---|---|
| `generateMnemonic(wordCount?)` | `MnemonicInfo` | Hasilkan mnemonic BIP-39 acak |
| `mnemonicToKeypair(phrase, network)` | `KeypairInfo` | Turunkan keypair dari mnemonic |
| `generateKeypair(network)` | `KeypairInfo` | Hasilkan keypair acak |
| `derivePublicKeys(phrase, network, receiveCount?, changeCount?)` | `{ receive, change }` | Derivasi HD wallet BIP-32 |
| `createAddress(publicKeyHex, network)` | `string` | Buat alamat dari kunci publik |
| `isValidAddress(address)` | `boolean` | Validasi alamat Kaspa |
| `signMessage(message, privateKeyHex)` | `string` | Tandatangani pesan, kembalikan tanda tangan hex |
| `verifyMessage(message, signature, publicKeyHex)` | `boolean` | Verifikasi pesan yang ditandatangani |
| `kaspaToSompi(kas)` | `bigint` | Konversi KAS (string/number) ke sompi |
| `sompiToKaspa(sompi)` | `string` | Konversi sompi ke string desimal KAS |
| `sompiToKaspaString(sompi, decimals?)` | `string` | Format sompi sebagai KAS dengan jumlah desimal opsional |

## Pembuatan mnemonic

```ts
const crypto = useCrypto()

// Mnemonic 24 kata (default)
const { phrase, wordCount } = crypto.generateMnemonic()
// phrase:    "abandon ability able ..."
// wordCount: 24

// Mnemonic 12 kata
const short = crypto.generateMnemonic(12)
```

::: warning Simpan dengan aman
Mnemonic adalah rahasia master untuk HD wallet. Jangan pernah mencatatnya, menyimpannya tanpa enkripsi, atau mengirimkannya melalui jaringan.
:::

## Keypair dari mnemonic

```ts
const { address, publicKeyHex, privateKeyHex } =
  crypto.mnemonicToKeypair(phrase, 'mainnet')

// address:       'kaspa:qr...'       (spesifik jaringan)
// publicKeyHex:  '02...'             (kunci publik terkompresi 33 byte)
// privateKeyHex: '...'               (kunci privat 32 byte)
```

Alamat yang diturunkan sesuai dengan kunci root (indeks 0). Untuk HD wallet dengan banyak alamat, gunakan `derivePublicKeys()`.

## Keypair acak

```ts
const keypair = crypto.generateKeypair('testnet-10')
// { address: 'kaspatest:qr...', publicKeyHex, privateKeyHex }
```

## Derivasi HD wallet (BIP-32)

Turunkan rantai alamat receive dan change dari mnemonic:

```ts
const { receive, change } = crypto.derivePublicKeys(
  phrase,
  'mainnet',
  10,   // 10 alamat receive pertama  (m/44'/111111'/0'/0/i)
  10,   // 10 alamat change pertama   (m/44'/111111'/0'/1/i)
)

receive.forEach(({ index, address, publicKeyHex }) => {
  console.log(`receive[${index}]: ${address}`)
})

change.forEach(({ index, address, publicKeyHex }) => {
  console.log(`change[${index}]:  ${address}`)
})
```

`receiveCount` dan `changeCount` default ke `10` jika diabaikan.

Setiap `DerivedKey` berisi:
```ts
interface DerivedKey {
  index: number         // Indeks kunci dalam rantai (berbasis 0)
  publicKeyHex: string  // Kunci publik terkompresi dalam hex
  address: string       // Alamat Kaspa spesifik jaringan
}
```

Perhatikan bahwa `derivePublicKeys` hanya mengembalikan kunci **publik** dan alamat. Untuk menandatangani transaksi, Anda harus menurunkan kunci privat secara terpisah (menggunakan `mnemonicToKeypair` atau logika jalur derivasi Anda sendiri).

## Utilitas alamat

```ts
// Buat alamat dari kunci publik
const address = crypto.createAddress('02abc...', 'mainnet')
// 'kaspa:qr...'

// Validasi alamat Kaspa apa pun
crypto.isValidAddress('kaspa:qr...')       // true
crypto.isValidAddress('kaspatest:qr...')   // true (testnet)
crypto.isValidAddress('invalid')           // false
crypto.isValidAddress('')                  // false
```

## Penandatanganan pesan

```ts
// Tandatangani pesan
const signature = crypto.signMessage('Hello Kaspa', privateKeyHex)
// mengembalikan string tanda tangan hex

// Verifikasi tanda tangan
const valid = crypto.verifyMessage('Hello Kaspa', signature, publicKeyHex)
// true
```

::: tip
Penandatanganan pesan bersifat off-chain — tidak membuat transaksi blockchain. Gunakan untuk membuktikan kepemilikan alamat tanpa membelanjakan dana.
:::

## Konversi unit

Jumlah Kaspa selalu ditangani sebagai `bigint` dalam sompi secara internal. **1 KAS = 100.000.000 sompi** (10⁸).

```ts
// String/number KAS → bigint sompi
const sompi = crypto.kaspaToSompi('1.5')        // 150_000_000n
const sompi2 = crypto.kaspaToSompi(10)          // 1_000_000_000n

// bigint sompi → string KAS
const kas = crypto.sompiToKaspa(150_000_000n)   // '1.5'

// bigint sompi → string KAS terformat dengan desimal tetap
const str = crypto.sompiToKaspaString(150_000_000n)      // '1.50000000'
const str2 = crypto.sompiToKaspaString(150_000_000n, 2)  // '1.50'
const str3 = crypto.sompiToKaspaString(150_000_000n, 0)  // '1'
```

Selalu gunakan `kaspaToSompi()` saat menerima input pengguna — fungsi ini menangani string desimal dengan benar.

## Alamat spesifik jaringan

Alamat di Kaspa bersifat spesifik jaringan:

| Jaringan | Awalan alamat |
|---|---|
| `'mainnet'` | `kaspa:` |
| `'testnet-10'`, `'testnet-11'` | `kaspatest:` |
| `'simnet'` | `kassim:` |
| `'devnet'` | `kaspadev:` |

Selalu berikan argumen `network` yang benar ke metode yang menghasilkan alamat:

```ts
const mainnetAddress = crypto.generateKeypair('mainnet').address
// 'kaspa:qr...'

const testnetAddress = crypto.generateKeypair('testnet-10').address
// 'kaspatest:qr...'
```

## Pertimbangan keamanan

- Jangan pernah mencatat `privateKeyHex` ke konsol atau mengirimkannya melalui jaringan
- Gunakan field `password input` saat mengumpulkan kunci privat dari pengguna
- `phrase` dari `generateMnemonic()` adalah rahasia master — perlakukan seperti kata sandi
- `signMessage()` menerima `privateKeyHex` sebagai string biasa — pastikan tidak bocor ke pesan error atau log
