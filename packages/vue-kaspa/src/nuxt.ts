import {
  addImports,
  addPluginTemplate,
  addVitePlugin,
  defineNuxtModule,
  extendRouteRules,
} from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { VueKaspaOptions } from 'vue-kaspa'
import wasm from 'vite-plugin-wasm'

export interface ModuleOptions extends VueKaspaOptions { }

// Required for SharedArrayBuffer which kaspa-wasm uses internally.
const COOP_COEP = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
} as const

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vue-kaspa',
    configKey: 'kaspa',
    compatibility: { nuxt: '>=3.0.0' },
  },
  defaults: {
    network: 'mainnet',
    autoConnect: true,
    panicHook: 'browser',
  },
  setup(options, nuxt: Nuxt) {
    // Enable proper WASM instantiation for browser builds.
    addVitePlugin(wasm())

    // Dev server: COOP/COEP headers so SharedArrayBuffer is available in the browser.
    nuxt.options.vite.server ??= {}
    nuxt.options.vite.server.headers = {
      ...COOP_COEP,
      ...(nuxt.options.vite.server.headers as Record<string, string> ?? {}),
    }

    // Production: COOP/COEP headers via Nitro route rules.
    extendRouteRules('/**', { headers: { ...COOP_COEP } })

    // Prevent kaspa-wasm from being bundled or evaluated on the server.
    nuxt.options.vite.ssr ??= {}
    const existing = nuxt.options.vite.ssr.external
    if (Array.isArray(existing)) {
      if (!existing.includes('@vue-kaspa/kaspa-wasm')) {
        existing.push('@vue-kaspa/kaspa-wasm')
      }
    } else {
      nuxt.options.vite.ssr.external = ['@vue-kaspa/kaspa-wasm']
    }

    // Prevent Vite from pre-bundling kaspa-wasm (incompatible with Vite optimizeDeps).
    nuxt.options.vite.optimizeDeps ??= {}
    nuxt.options.vite.optimizeDeps.exclude ??= []
    if (!nuxt.options.vite.optimizeDeps.exclude.includes('@vue-kaspa/kaspa-wasm')) {
      nuxt.options.vite.optimizeDeps.exclude.push('@vue-kaspa/kaspa-wasm')
    }

    // Inject a client-only plugin that installs VueKaspa with the resolved options.
    addPluginTemplate({
      filename: 'vue-kaspa.client.mjs',
      mode: 'client',
      getContents: () => `
import { defineNuxtPlugin } from 'nuxt/app'
import { VueKaspa, useKaspa, useRpc } from 'vue-kaspa'

export default defineNuxtPlugin((nuxtApp) => {
  const options = ${JSON.stringify(options)}
  nuxtApp.vueApp.use(VueKaspa, options)
${options.autoConnect !== false ? `
  // autoConnect: init WASM and establish the RPC connection on startup.
  // runWithContext makes inject() available outside component setup.
  nuxtApp.vueApp.runWithContext(() => {
    const kaspa = useKaspa()
    const rpc = useRpc()
    kaspa.init().then(() => rpc.connect()).catch(() => {})
  })
` : ''}})
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
