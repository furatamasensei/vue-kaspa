export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: ['vue-kaspa/nuxt'],
  kaspa: {
    network: 'mainnet',
    autoConnect: true,
  },
})
