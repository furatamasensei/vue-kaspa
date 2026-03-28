import type { App } from 'vue'
import { KASPA_INSTALLED_KEY, KASPA_OPTIONS_KEY } from './symbols'
import type { KaspaPluginOptions } from './types'

function resolveOptions(options: KaspaPluginOptions): KaspaPluginOptions {
  return {
    network: options.network ?? 'mainnet',
    resolver: options.url ? false : (options.resolver ?? true),
    encoding: options.encoding ?? 'Borsh',
    autoConnect: options.autoConnect ?? true,
    devtools: options.devtools ?? (typeof __DEV__ !== 'undefined' ? __DEV__ : false),
    panicHook: options.panicHook ?? 'console',
    ...options,
  }
}

export const KaspaPlugin = {
  install(app: App, options: KaspaPluginOptions = {}): void {
    if (app._context.provides[KASPA_INSTALLED_KEY as unknown as string]) {
      console.warn('[vue-kaspa] Plugin already installed.')
      return
    }

    const resolved = resolveOptions(options)
    app.provide(KASPA_OPTIONS_KEY, resolved)
    app.provide(KASPA_INSTALLED_KEY, true)

    // Setup DevTools integration
    if (resolved.devtools) {
      // Dynamic import so devtools code is tree-shaken in production
      import('./devtools/index').then(({ setupDevtools }) => {
        setupDevtools(app)
      }).catch(() => {
        // DevTools setup is non-critical
      })
    }
  },
}

declare const __DEV__: boolean
