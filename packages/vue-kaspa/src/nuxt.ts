import { addImports, addPluginTemplate, defineNuxtModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { KaspaPluginOptions } from 'vkas'

export interface ModuleOptions extends KaspaPluginOptions { }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vkas',
    configKey: 'kaspa',
    compatibility: { nuxt: '^3.0.0' },
  },
  defaults: {
    network: 'mainnet',
    autoConnect: true,
    panicHook: 'browser',
  },
  setup(options, nuxt: Nuxt) {
    // Prevent kaspa-wasm from being bundled or evaluated on the server —
    // WASM only runs in browser environments.
    nuxt.options.vite.ssr ??= {}
    const existing = nuxt.options.vite.ssr.external
    if (Array.isArray(existing)) {
      existing.push('kaspa-wasm')
    } else {
      nuxt.options.vite.ssr.external = ['kaspa-wasm']
    }

    // Inject a client-only plugin that installs KaspaPlugin with the resolved options.
    // Using addPluginTemplate lets us inline the options at module build time without
    // needing a separate runtime plugin file.
    addPluginTemplate({
      filename: 'vkas.client.mjs',
      mode: 'client',
      getContents: () => `
import { defineNuxtPlugin } from 'nuxt/app'
import { KaspaPlugin } from 'vkas'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(KaspaPlugin, ${JSON.stringify(options)})
})
`,
    })

    // Auto-import all composables — users don't need explicit imports in their pages.
    addImports([
      { name: 'useKaspa', from: 'vkas' },
      { name: 'useRpc', from: 'vkas' },
      { name: 'useUtxo', from: 'vkas' },
      { name: 'useTransaction', from: 'vkas' },
      { name: 'useCrypto', from: 'vkas' },
      { name: 'useNetwork', from: 'vkas' },
    ])
  },
})
