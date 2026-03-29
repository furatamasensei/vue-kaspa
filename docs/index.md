---
layout: home
hero:
  name: VKAS
  text: The Fastest Chain Meets Great DX 
  tagline: Kaspa is fast! But making it works on Vue was a nightmare. This plugin simplifies that.
  image:
    src: /logo.png
    alt: VKAS
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: brand
      text: Try the CLI
      link: /guide/installation#quick-setup
    - theme: alt
      text: Composables
      link: /composables/use-kaspa

features:
  - icon: 🚀
    title: CLI scaffolding
    details: Run npx vue-kaspa-cli to scaffold a Vue 3 or Nuxt 4 starter project pre-wired with WASM, CORS headers, and a live KaspaStatus component. Zero config.
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

<div style="max-width:800px;margin:3rem auto;padding:2rem;border:1px solid var(--vp-c-divider);border-radius:12px;background:var(--vp-c-bg-soft);text-align:center;">
  <p style="font-size:1.1rem;font-weight:600;margin:0 0 .5rem;">Support this project ❤️</p>
  <p style="color:var(--vp-c-text-2);margin:0 0 1.25rem;font-size:.95rem;">vue-kaspa is free and open-source. If it saves you time, consider sending some KAS — every bit helps keep the project alive and maintained.</p>
  <code style="display:inline-block;padding:.6em 1em;border-radius:8px;background:var(--vp-c-bg-mute);font-size:.8rem;word-break:break-all;color:var(--vp-c-text-1);">kaspa:qypr7ayn2g55fccyv9n6gf9zgrcnpepkfgjf9d8mtfp68ezv3mgqnggxqs902q4</code>
  <p style="color:var(--vp-c-text-3);margin:1rem 0 0;font-size:.85rem;">Thank you for your support — it means a lot. 🙏</p>
</div>
