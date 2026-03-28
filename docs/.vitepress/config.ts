import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'VKAS',
  description: 'Vue 3 composables and Nuxt module for the Kaspa blockchain',

  head: [
    ['link', { rel: 'icon', href: '/logo.png', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#70C7BA' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'VKAS' }],
    ['meta', {
      property: 'og:description',
      content: 'Vue 3 composables and Nuxt module for the Kaspa blockchain',
    }],
  ],

  themeConfig: {
    logo: '/logo.png',
    siteTitle: 'VKAS',

    nav: [
      { text: 'Guide', link: '/guide/introduction', activeMatch: '/guide/' },
      { text: 'Composables', link: '/composables/use-kaspa', activeMatch: '/composables/' },
      { text: 'Reference', link: '/reference/types', activeMatch: '/reference/' },
      { text: 'AI & LLMs', link: '/llms/', activeMatch: '/llms/' },
      {
        text: 'v0.1.0',
        items: [
          { text: 'Changelog', link: '/reference/changelog' },
          { text: 'GitHub', link: 'https://github.com/furatamasensei/vue-kaspa' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Vue Plugin', link: '/guide/vue-plugin' },
            { text: 'Nuxt Module', link: '/guide/nuxt-module' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Vue DevTools', link: '/guide/devtools' },
            { text: 'Error Handling', link: '/guide/error-handling' },
          ],
        },
      ],
      '/composables/': [
        {
          text: 'Composables',
          items: [
            { text: 'useKaspa', link: '/composables/use-kaspa' },
            { text: 'useRpc', link: '/composables/use-rpc' },
            { text: 'useUtxo', link: '/composables/use-utxo' },
            { text: 'useTransaction', link: '/composables/use-transaction' },
            { text: 'useCrypto', link: '/composables/use-crypto' },
            { text: 'useNetwork', link: '/composables/use-network' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'TypeScript Types', link: '/reference/types' },
            { text: 'Constants', link: '/reference/constants' },
            { text: 'Changelog', link: '/reference/changelog' },
          ],
        },
      ],
      '/llms/': [
        {
          text: 'AI & LLMs',
          items: [
            { text: 'Overview', link: '/llms/' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/furatamasensei/vue-kaspa' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Kaspa Contributors',
    },

    outline: {
      level: [2, 3],
    },
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'one-dark-pro',
    },
  },
})
