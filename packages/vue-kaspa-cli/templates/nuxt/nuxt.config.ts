export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: ['vue-kaspa/nuxt'],
  kaspa: {
    network: 'mainnet',
    autoConnect: true,
  },
  // SharedArrayBuffer requires COOP/COEP headers in both dev and production.
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'Cross-Origin-Embedder-Policy': 'require-corp',
          'Cross-Origin-Opener-Policy': 'same-origin',
        },
      },
    },
  },
})
