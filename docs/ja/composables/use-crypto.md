# useCrypto

純粋な暗号ユーティリティ: ニーモニック生成、HD キー導出、アドレス操作、メッセージ署名、単位変換。

すべてのメソッドは同期的で、プレーンな値を返します — リアクティブな ref はありません。

## インポート

```ts
import { useCrypto } from 'vue-kaspa'
```

## メソッドリファレンス

| メソッド | 戻り値 | 説明 |
|---|---|---|
| `generateMnemonic(wordCount?)` | `MnemonicInfo` | ランダムな BIP-39 ニーモニックを生成する |
| `mnemonicToKeypair(phrase, network)` | `KeypairInfo` | ニーモニックからキーペアを導出する |
| `generateKeypair(network)` | `KeypairInfo` | ランダムなキーペアを生成する |
| `derivePublicKeys(phrase, network, receiveCount?, changeCount?)` | `{ receive, change }` | BIP-32 HD ウォレット導出 |
| `createAddress(publicKeyHex, network)` | `string` | 公開鍵からアドレスを作成する |
| `isValidAddress(address)` | `boolean` | Kaspa アドレスを検証する |
| `signMessage(message, privateKeyHex)` | `string` | メッセージを署名し、16 進の署名を返す |
| `verifyMessage(message, signature, publicKeyHex)` | `boolean` | 署名されたメッセージを検証する |
| `kaspaToSompi(kas)` | `bigint` | KAS (文字列/数値) を sompi に変換する |
| `sompiToKaspa(sompi)` | `string` | sompi を KAS の小数文字列に変換する |
| `sompiToKaspaString(sompi, decimals?)` | `string` | sompi をオプションの小数点以下桁数で KAS としてフォーマットする |

## ニーモニック生成

```ts
const crypto = useCrypto()

// 24-word mnemonic (default)
const { phrase, wordCount } = crypto.generateMnemonic()
// phrase:    "abandon ability able ..."
// wordCount: 24

// 12-word mnemonic
const short = crypto.generateMnemonic(12)
```

::: warning 安全に保管してください
ニーモニックは HD ウォレットのマスターシークレットです。ログに記録したり、暗号化せずに保存したり、ネットワーク越しに送信しないでください。
:::

## ニーモニックからキーペアを生成する

```ts
const { address, publicKeyHex, privateKeyHex } =
  crypto.mnemonicToKeypair(phrase, 'mainnet')

// address:       'kaspa:qr...'       (network-specific)
// publicKeyHex:  '02...'             (33-byte compressed public key)
// privateKeyHex: '...'               (32-byte private key)
```

導出されたアドレスはルートキー (インデックス 0) に対応します。多数のアドレスを持つ HD ウォレットには、代わりに `derivePublicKeys()` を使用してください。

## ランダムキーペア

```ts
const keypair = crypto.generateKeypair('testnet-10')
// { address: 'kaspatest:qr...', publicKeyHex, privateKeyHex }
```

## HD ウォレット導出 (BIP-32)

ニーモニックから受信アドレスチェーンと変更アドレスチェーンを導出する:

```ts
const { receive, change } = crypto.derivePublicKeys(
  phrase,
  'mainnet',
  10,   // first 10 receive addresses  (m/44'/111111'/0'/0/i)
  10,   // first 10 change addresses   (m/44'/111111'/0'/1/i)
)

receive.forEach(({ index, address, publicKeyHex }) => {
  console.log(`receive[${index}]: ${address}`)
})

change.forEach(({ index, address, publicKeyHex }) => {
  console.log(`change[${index}]:  ${address}`)
})
```

`receiveCount` と `changeCount` を省略した場合は `10` がデフォルトになります。

各 `DerivedKey` の内容:
```ts
interface DerivedKey {
  index: number         // Key index in the chain (0-based)
  publicKeyHex: string  // Compressed public key hex
  address: string       // Network-specific Kaspa address
}
```

`derivePublicKeys` は**公開**鍵とアドレスのみを返します。トランザクションに署名するには、秘密鍵を別途導出する必要があります (`mnemonicToKeypair` や独自の導出パスロジックを使用)。

## アドレスユーティリティ

```ts
// Create address from a public key
const address = crypto.createAddress('02abc...', 'mainnet')
// 'kaspa:qr...'

// Validate any Kaspa address
crypto.isValidAddress('kaspa:qr...')       // true
crypto.isValidAddress('kaspatest:qr...')   // true (testnet)
crypto.isValidAddress('invalid')           // false
crypto.isValidAddress('')                  // false
```

## メッセージ署名

```ts
// Sign a message
const signature = crypto.signMessage('Hello Kaspa', privateKeyHex)
// returns hex signature string

// Verify a signature
const valid = crypto.verifyMessage('Hello Kaspa', signature, publicKeyHex)
// true
```

::: tip
メッセージ署名はオフチェーンです — ブロックチェーントランザクションは作成されません。資金を使用せずにアドレスの所有権を証明するために使用してください。
:::

## 単位変換

Kaspa の金額は内部的に常に sompi の `bigint` として扱われます。**1 KAS = 100,000,000 sompi** (10⁸)。

```ts
// KAS string/number → sompi bigint
const sompi = crypto.kaspaToSompi('1.5')        // 150_000_000n
const sompi2 = crypto.kaspaToSompi(10)          // 1_000_000_000n

// sompi bigint → KAS string
const kas = crypto.sompiToKaspa(150_000_000n)   // '1.5'

// sompi bigint → formatted KAS string with fixed decimals
const str = crypto.sompiToKaspaString(150_000_000n)      // '1.50000000'
const str2 = crypto.sompiToKaspaString(150_000_000n, 2)  // '1.50'
const str3 = crypto.sompiToKaspaString(150_000_000n, 0)  // '1'
```

ユーザー入力を受け付ける際は常に `kaspaToSompi()` を使用してください — 小数文字列を正しく処理します。

## ネットワーク固有のアドレス

Kaspa のアドレスはネットワーク固有です:

| ネットワーク | アドレスプレフィックス |
|---|---|
| `'mainnet'` | `kaspa:` |
| `'testnet-10'`、`'testnet-11'` | `kaspatest:` |
| `'simnet'` | `kassim:` |
| `'devnet'` | `kaspadev:` |

アドレスを生成するメソッドを呼び出す際は、常に正しい `network` 引数を渡してください:

```ts
const mainnetAddress = crypto.generateKeypair('mainnet').address
// 'kaspa:qr...'

const testnetAddress = crypto.generateKeypair('testnet-10').address
// 'kaspatest:qr...'
```

## セキュリティに関する注意事項

- `privateKeyHex` をコンソールに記録したり、ネットワーク越しに送信しないでください
- ユーザーから秘密鍵を収集する際は `password input` フィールドを使用してください
- `generateMnemonic()` の `phrase` はマスターシークレットです — パスワードのように扱ってください
- `signMessage()` は `privateKeyHex` を文字列として受け取ります — エラーメッセージやログに漏れないよう注意してください
