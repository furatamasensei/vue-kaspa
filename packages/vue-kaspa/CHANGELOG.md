# Changelog

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
