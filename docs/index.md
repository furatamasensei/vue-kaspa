---
layout: home
hero:
  name: VKAS
  text: The Fastest Chain Meets Great DX 
  tagline: Reactive composables and a Nuxt module for the Kaspa blockchain — powered by WASM.
  image:
    src: /logo.png
    alt: VKAS
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: Composables
      link: /composables/use-kaspa

features:
  - icon: ⚡
    title: Reactive by default
    details: WASM status, connection state, UTXOs, and balances are Vue reactive refs — no manual wiring needed.
  - icon: 🧩
    title: Vue Plugin + Nuxt Module
    details: Install once with app.use(KaspaPlugin) or add to nuxt.config.ts. All composables are auto-imported in Nuxt.
  - icon: 🔑
    title: Full wallet toolkit
    details: BIP-39 mnemonic generation, BIP-32 HD key derivation, address utilities, message signing, and unit conversion.
  - icon: 🛠
    title: Developer experience
    details: TypeScript-first with strict types, Vue DevTools inspector and event timeline, and a structured error hierarchy.
---
