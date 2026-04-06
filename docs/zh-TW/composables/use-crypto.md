# useCrypto

純粹的加密工具集：助記詞生成、HD 金鑰衍生、地址操作、訊息簽署與單位換算。

所有方法均為同步執行，回傳純值——沒有響應式 ref。

## 匯入

```ts
import { useCrypto } from 'vue-kaspa'
```

## 方法參考

| 方法 | 回傳值 | 說明 |
|---|---|---|
| `generateMnemonic(wordCount?)` | `MnemonicInfo` | 生成隨機 BIP-39 助記詞 |
| `mnemonicToKeypair(phrase, network)` | `KeypairInfo` | 從助記詞衍生金鑰對 |
| `generateKeypair(network)` | `KeypairInfo` | 生成隨機金鑰對 |
| `derivePublicKeys(phrase, network, receiveCount?, changeCount?)` | `{ receive, change }` | BIP-32 HD 錢包衍生 |
| `createAddress(publicKeyHex, network)` | `string` | 從公鑰建立地址 |
| `isValidAddress(address)` | `boolean` | 驗證 Kaspa 地址 |
| `signMessage(message, privateKeyHex)` | `string` | 簽署訊息，回傳十六進位簽名 |
| `verifyMessage(message, signature, publicKeyHex)` | `boolean` | 驗證已簽署的訊息 |
| `kaspaToSompi(kas)` | `bigint` | 將 KAS（字串/數字）轉換為 sompi |
| `sompiToKaspa(sompi)` | `string` | 將 sompi 轉換為 KAS 十進位字串 |
| `sompiToKaspaString(sompi, decimals?)` | `string` | 將 sompi 格式化為帶選用小數位的 KAS 字串 |
| `currencyUnit(network?)` | `'KAS' \| 'TKAS'` | 根據網路取得目前單位標籤（mainnet 是 KAS，其餘是 TKAS） |
| `numberToKaspa(sompi, network?)` | `string` | 以目前網路的後綴格式化 sompi |
| `numberToSompi(kas)` | `bigint` | `kaspaToSompi()` 的別名 |

## 助記詞生成

```ts
const crypto = useCrypto()

// 24-word mnemonic (default)
const { phrase, wordCount } = crypto.generateMnemonic()
// phrase:    "abandon ability able ..."
// wordCount: 24

// 12-word mnemonic
const short = crypto.generateMnemonic(12)
```

::: warning 請安全儲存
助記詞是 HD 錢包的主要密鑰。切勿記錄日誌、以未加密形式儲存或透過網路傳輸。
:::

## 從助記詞衍生金鑰對

```ts
const { address, publicKeyHex, privateKeyHex } =
  crypto.mnemonicToKeypair(phrase, 'mainnet')

// address:       'kaspa:qr...'       (network-specific)
// publicKeyHex:  '02...'             (33-byte compressed public key)
// privateKeyHex: '...'               (32-byte private key)
```

衍生的地址對應於根金鑰（索引 0）。如需具有多個地址的 HD 錢包，請改用 `derivePublicKeys()`。

## 隨機金鑰對

```ts
const keypair = crypto.generateKeypair('testnet-10')
// { address: 'kaspatest:qr...', publicKeyHex, privateKeyHex }
```

## HD 錢包衍生（BIP-32）

從助記詞衍生收款與找零地址鏈：

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

省略時 `receiveCount` 與 `changeCount` 預設為 `10`。

每個 `DerivedKey` 包含：
```ts
interface DerivedKey {
  index: number         // Key index in the chain (0-based)
  publicKeyHex: string  // Compressed public key hex
  address: string       // Network-specific Kaspa address
}
```

請注意，`derivePublicKeys` 只回傳**公**鑰與地址。若要簽署交易，必須另外衍生私鑰（使用 `mnemonicToKeypair` 或自訂衍生路徑邏輯）。

## 地址工具

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

## 訊息簽署

```ts
// Sign a message
const signature = crypto.signMessage('Hello Kaspa', privateKeyHex)
// returns hex signature string

// Verify a signature
const valid = crypto.verifyMessage('Hello Kaspa', signature, publicKeyHex)
// true
```

::: tip
訊息簽署是鏈下操作——它不會建立區塊鏈交易。使用它來證明地址的所有權而不需要花費資金。
:::

## 單位換算

Kaspa 金額在內部始終以 sompi 的 `bigint` 形式處理。**1 KAS = 100,000,000 sompi**（10⁸）。

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

// 配合網路顯示的輔助函式
const unit = crypto.currencyUnit()                       // mainnet 顯示 'KAS'，其他網路顯示 'TKAS'
const display = crypto.numberToKaspa(150_000_000n)       // 例如 '1.50000000 KAS'
const sompiFromNumber = crypto.numberToSompi('1.5')      // 150_000_000n
```

接受使用者輸入時請務必使用 `kaspaToSompi()`——它能正確處理小數字串。

`currencyUnit()` 與 `numberToKaspa()` 預設使用 `useNetwork()` 的目前網路。如需格式化其他網路，可傳入 `network` 參數。

## 網路特定地址

Kaspa 中的地址是網路特定的：

| 網路 | 地址前綴 |
|---|---|
| `'mainnet'` | `kaspa:` |
| `'testnet-10'`、`'testnet-12'` | `kaspatest:` |
| `'simnet'` | `kassim:` |
| `'devnet'` | `kaspadev:` |

呼叫生成地址的方法時請務必傳入正確的 `network` 參數：

```ts
const mainnetAddress = crypto.generateKeypair('mainnet').address
// 'kaspa:qr...'

const testnetAddress = crypto.generateKeypair('testnet-10').address
// 'kaspatest:qr...'
```

## 安全注意事項

- 切勿將 `privateKeyHex` 記錄到主控台或透過網路傳送
- 向使用者收集私鑰時使用 `password input` 欄位
- `generateMnemonic()` 回傳的 `phrase` 是主要密鑰——請像對待密碼一樣保護它
- `signMessage()` 接受 `privateKeyHex` 為純字串——確保它不會洩露到錯誤訊息或日誌中
