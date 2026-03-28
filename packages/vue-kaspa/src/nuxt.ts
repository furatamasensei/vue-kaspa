import { defineNuxtModule, addPluginTemplate, addImports } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { KaspaPluginOptions } from 'vue-kaspa'

export interface ModuleOptions extends KaspaPluginOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vue-kaspa',
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
    nuxt.hook('vite:extendConfig', (config: Record<string, unknown> & { ssr?: { external?: string[] } }, { isServer }: { isServer: boolean }) => {
      if (isServer) {
        config.ssr ??= {}
        const existing = config.ssr.external
        if (Array.isArray(existing)) {
          existing.push('kaspa-wasm')
        } else {
          config.ssr.external = ['kaspa-wasm']
        }
      }
    })

    // Inject a client-only plugin that installs KaspaPlugin with the resolved options.
    // Using addPluginTemplate lets us inline the options at module build time without
    // needing a separate runtime plugin file.
    addPluginTemplate({
      filename: 'vue-kaspa.client.mjs',
      mode: 'client',
      getContents: () => `
import { defineNuxtPlugin } from 'nuxt/app'
import { KaspaPlugin } from 'vue-kaspa'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(KaspaPlugin, ${JSON.stringify(options)})
})
`,
    })

    // Auto-import all composables — users don't need explicit imports in their pages.
    addImports([
      { name: 'useKaspa', from: 'vue-kaspa' },
      { name: 'useRpc', from: 'vue-kaspa' },
      { name: 'useUtxo', from: 'vue-kaspa' },
      { name: 'useTransaction', from: 'vue-kaspa' },
      { name: 'useCrypto', from: 'vue-kaspa' },
      { name: 'useNetwork', from: 'vue-kaspa' },
    ])
  },
})
