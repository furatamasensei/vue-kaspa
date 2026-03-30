# Changelog

## [0.1.11](https://github.com/furatamasensei/vue-kaspa/compare/vue-kaspa-v0.1.10...vue-kaspa-v0.1.11) (2026-03-30)


### Bug Fixes

* import vue-kaspa component CSS in playground ([3148509](https://github.com/furatamasensei/vue-kaspa/commit/31485094f51b8d890f390e302a2ef4c1a96432fb))

## [0.1.10](https://github.com/furatamasensei/vue-kaspa/compare/vue-kaspa-v0.1.9...vue-kaspa-v0.1.10) (2026-03-30)


### Features

* add ConnectWallet component and wallet documentation ([c76a25c](https://github.com/furatamasensei/vue-kaspa/commit/c76a25cafba70b07e4a4de740495fcda8e1ed444))
* add useWallet composable for third-party wallet integration ([83f47ca](https://github.com/furatamasensei/vue-kaspa/commit/83f47caac3e004c5d9f3068279c811b5e35130df))
* overhaul Vue DevTools integration ([21fd4ed](https://github.com/furatamasensei/vue-kaspa/commit/21fd4ed85f9ac3da6d90f4919cc32d74f9955774))
* use official wallet logos in ConnectWallet component ([5ac58b6](https://github.com/furatamasensei/vue-kaspa/commit/5ac58b6cf5ed5b9474561239c324af5d1361fd9a))


### Bug Fixes

* poll KasWare accounts to detect switches reliably ([f737049](https://github.com/furatamasensei/vue-kaspa/commit/f73704973035d7dda1704cad58b0557b9de77935))
* refresh public key and balance on KasWare account switch ([937546f](https://github.com/furatamasensei/vue-kaspa/commit/937546f78f11cda12c366aba635c9ff5230d6486))
* update Vue DevTools plugin logo and label ([3635fcc](https://github.com/furatamasensei/vue-kaspa/commit/3635fccaba4e77850bbfd93480eff121e4c290ed))
* use project logo as Vue DevTools plugin icon ([48527c4](https://github.com/furatamasensei/vue-kaspa/commit/48527c41207f9aba08a0a0cfe64fdca96d25ae01))

## [0.1.9](https://github.com/furatamasensei/vue-kaspa/compare/vue-kaspa-v0.1.8...vue-kaspa-v0.1.9) (2026-03-29)


### Features

* bento link cards, testnet-12, and donation section ([3e14f3e](https://github.com/furatamasensei/vue-kaspa/commit/3e14f3e94c0a8256ff4ac766c2aecf69caac265e))

## [0.1.8](https://github.com/furatamasensei/vue-kaspa/compare/vue-kaspa-v0.1.7...vue-kaspa-v0.1.8) (2026-03-29)


### Bug Fixes

* implement autoConnect in Nuxt module client plugin ([b4aa823](https://github.com/furatamasensei/vue-kaspa/commit/b4aa8239e56f9280cad44f5151dca216eaca808f))

## [0.1.7](https://github.com/furatamasensei/vue-kaspa/compare/vue-kaspa-v0.1.6...vue-kaspa-v0.1.7) (2026-03-28)


### Bug Fixes

* **cli:** bump scaffolded project deps to latest stable ([276d5ec](https://github.com/furatamasensei/vue-kaspa/commit/276d5ece580992f943de59b2aedef2dc27552f71))

## [0.1.6](https://github.com/furatamasensei/vue-kaspa/compare/vue-kaspa-v0.1.5...vue-kaspa-v0.1.6) (2026-03-28)


### Bug Fixes

* **nuxt:** ensure vite-plugin-wasm applies in Nuxt 4 ([7b25fde](https://github.com/furatamasensei/vue-kaspa/commit/7b25fde64334b193a5a2a7e0eeec2169cca64256))

## [0.1.5](https://github.com/furatamasensei/vue-kaspa/compare/vue-kaspa-v0.1.4...vue-kaspa-v0.1.5) (2026-03-28)


### Bug Fixes

* **nuxt:** wire WASM support fully in the Nuxt module ([6ff8217](https://github.com/furatamasensei/vue-kaspa/commit/6ff8217b2b72a3658c23a4c4e636ddae2be6e872))

## [0.1.4](https://github.com/furatamasensei/vue-kaspa/compare/vue-kaspa-v0.1.3...vue-kaspa-v0.1.4) (2026-03-28)


### Bug Fixes

* support Nuxt 4 in module and CLI template ([990007f](https://github.com/furatamasensei/vue-kaspa/commit/990007f63012854ef0d3bab8d0185c1be8e04e2c))

## [0.1.3](https://github.com/furatamasensei/vue-kaspa/compare/vue-kaspa-v0.1.2...vue-kaspa-v0.1.3) (2026-03-28)


### Bug Fixes

* centralize kaspa-wasm access via single dynamic import to prevent Rolldown chunk duplication ([40b2452](https://github.com/furatamasensei/vue-kaspa/commit/40b2452a06c2d7bf2c0308efb7bd52fa09d859aa))
* use globalThis to store kaspa-wasm singleton across chunk boundaries ([89f6983](https://github.com/furatamasensei/vue-kaspa/commit/89f6983a57cd323b9db2a2ef188c437f1e595e2c))

## [0.1.2](https://github.com/furatamasensei/vue-kaspa/compare/vue-kaspa-v0.1.1...vue-kaspa-v0.1.2) (2026-03-28)


### Bug Fixes

* mark @vue-kaspa/kaspa-wasm as external in vite build ([c40523b](https://github.com/furatamasensei/vue-kaspa/commit/c40523bcda0323dc82a15b758160cd0f48a8eb86))

## [0.1.1](https://github.com/furatamasensei/Vue Kaspa/compare/vue-kaspa-v0.1.0...vue-kaspa-v0.1.1) (2026-03-28)


### Features

* add Nuxt module support (vue-kaspa/nuxt) ([bd0aa3b](https://github.com/furatamasensei/Vue Kaspa/commit/bd0aa3bdc7afe830518bae87adf5b8e0e6307723))
* initial vue-kaspa plugin with playground ([a9e8efd](https://github.com/furatamasensei/Vue Kaspa/commit/a9e8efda4ea27436bb4c3010c95e060ece67ecec))
* rename to vue-kaspa, add @vue-kaspa/kaspa-wasm, release workflow ([731310f](https://github.com/furatamasensei/Vue Kaspa/commit/731310fdb0b48042c23383c590dd9bdc80fd24fd))
* replace useWallet with useUtxo + useTransaction for cross-platform support ([3a23927](https://github.com/furatamasensei/Vue Kaspa/commit/3a23927c54646f60afb234376f1cf8ad3e835113))
* rewrite playground with shadcn-vue + Tailwind CSS v4 ([e7cfde4](https://github.com/furatamasensei/Vue Kaspa/commit/e7cfde4e6fab6311177b8019bd5e4dd7903668f5))


### Bug Fixes

* address review feedback across playground and plugin ([6149d80](https://github.com/furatamasensei/Vue Kaspa/commit/6149d80129ded8c1d6e6421665b9caa254cf8c81))
* resolve TypeScript errors in nuxt.ts ([7f9c2d5](https://github.com/furatamasensei/Vue Kaspa/commit/7f9c2d594547016dbdd1b4fc5104f1d4a02e2d5c))
