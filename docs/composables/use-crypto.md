# useCrypto

Pure cryptographic utilities: mnemonic generation, HD key derivation, address operations, message signing, and unit conversion.

All methods are synchronous and return plain values — there are no reactive refs.

## Import

```ts
import { useCrypto } from 'vue-kaspa'
```

## Method reference

| Method | Returns | Description |
|---|---|---|
| `generateMnemonic(wordCount?)` | `MnemonicInfo` | Generate a random BIP-39 mnemonic |
| `mnemonicToKeypair(phrase, network)` | `KeypairInfo` | Derive a keypair from a mnemonic |
| `generateKeypair(network)` | `KeypairInfo` | Generate a random keypair |
| `derivePublicKeys(phrase, network, receiveCount?, changeCount?)` | `{ receive, change }` | BIP-32 HD wallet derivation |
| `createAddress(publicKeyHex, network)` | `string` | Create an address from a public key |
| `isValidAddress(address)` | `boolean` | Validate a Kaspa address |
| `signMessage(message, privateKeyHex)` | `string` | Sign a message, returns hex signature |
| `verifyMessage(message, signature, publicKeyHex)` | `boolean` | Verify a signed message |
| `kaspaToSompi(kas)` | `bigint` | Convert KAS (string/number) to sompi |
| `sompiToKaspa(sompi)` | `string` | Convert sompi to KAS decimal string |
| `sompiToKaspaString(sompi, decimals?)` | `string` | Format sompi as KAS with optional decimal places |

## Mnemonic generation

```ts
const crypto = useCrypto()

// 24-word mnemonic (default)
const { phrase, wordCount } = crypto.generateMnemonic()
// phrase:    "abandon ability able ..."
// wordCount: 24

// 12-word mnemonic
const short = crypto.generateMnemonic(12)
```

::: warning Store securely
The mnemonic is the master secret for an HD wallet. Never log, store unencrypted, or transmit it over a network.
:::

## Keypair from mnemonic

```ts
const { address, publicKeyHex, privateKeyHex } =
  crypto.mnemonicToKeypair(phrase, 'mainnet')

// address:       'kaspa:qr...'       (network-specific)
// publicKeyHex:  '02...'             (33-byte compressed public key)
// privateKeyHex: '...'               (32-byte private key)
```

The derived address corresponds to the root key (index 0). For HD wallets with many addresses, use `derivePublicKeys()` instead.

## Random keypair

```ts
const keypair = crypto.generateKeypair('testnet-10')
// { address: 'kaspatest:qr...', publicKeyHex, privateKeyHex }
```

## HD wallet derivation (BIP-32)

Derive receive and change address chains from a mnemonic:

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

`receiveCount` and `changeCount` default to `10` when omitted.

Each `DerivedKey` contains:
```ts
interface DerivedKey {
  index: number         // Key index in the chain (0-based)
  publicKeyHex: string  // Compressed public key hex
  address: string       // Network-specific Kaspa address
}
```

Note that `derivePublicKeys` returns only the **public** keys and addresses. To sign transactions you must separately derive the private keys (using `mnemonicToKeypair` or your own derivation path logic).

## Address utilities

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

## Message signing

```ts
// Sign a message
const signature = crypto.signMessage('Hello Kaspa', privateKeyHex)
// returns hex signature string

// Verify a signature
const valid = crypto.verifyMessage('Hello Kaspa', signature, publicKeyHex)
// true
```

::: tip
Message signing is off-chain — it does not create a blockchain transaction. Use it to prove ownership of an address without spending funds.
:::

## Unit conversion

Kaspa amounts are always handled as `bigint` in sompi internally. **1 KAS = 100,000,000 sompi** (10⁸).

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

Always use `kaspaToSompi()` when accepting user input — it handles decimal strings correctly.

## Network-specific addresses

Addresses in Kaspa are network-specific:

| Network | Address prefix |
|---|---|
| `'mainnet'` | `kaspa:` |
| `'testnet-10'`, `'testnet-11'` | `kaspatest:` |
| `'simnet'` | `kassim:` |
| `'devnet'` | `kaspadev:` |

Always pass the correct `network` argument to address-generating methods:

```ts
const mainnetAddress = crypto.generateKeypair('mainnet').address
// 'kaspa:qr...'

const testnetAddress = crypto.generateKeypair('testnet-10').address
// 'kaspatest:qr...'
```

## Security considerations

- Never log `privateKeyHex` to the console or send it over a network
- Use `password input` fields when collecting private keys from users
- The `phrase` from `generateMnemonic()` is the master secret — treat it like a password
- `signMessage()` accepts `privateKeyHex` as a plain string — ensure it doesn't leak into error messages or logs
