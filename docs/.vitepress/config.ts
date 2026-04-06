import { createRequire } from 'module'
import { defineConfig } from 'vitepress'

const require = createRequire(import.meta.url)
const { version } = require('../../packages/vue-kaspa/package.json')

const nav = (locale: string) => {
  const base = locale ? `/${locale}` : ''
  const t = (en: string, id: string, ja: string, zhTW: string) =>
    ({ '': en, id, ja, 'zh-TW': zhTW }[locale] ?? en)
  return [
    {
      text: `v${version}`,
      items: [
        {
          text: t('Changelog', 'Catatan Perubahan', '変更履歴', '更新日誌'),
          link: `${base}/reference/changelog`,
        },
        { text: 'npm', link: 'https://www.npmjs.com/package/vue-kaspa' },
        { text: 'GitHub', link: 'https://github.com/furatamasensei/vue-kaspa' },
      ],
    },
  ]
}

const sidebar = (locale: string) => {
  const base = locale ? `/${locale}` : ''
  const t = (en: string, id: string, ja: string, zhTW: string) =>
    ({ '': en, id, ja, 'zh-TW': zhTW }[locale] ?? en)

  const items = [
    {
      text: t('Getting Started', 'Mulai', 'はじめに', '快速開始'),
      items: [
        { text: t('Introduction', 'Pengenalan', 'はじめに', '介紹'), link: `${base}/guide/introduction` },
        { text: t('Installation', 'Instalasi', 'インストール', '安裝'), link: `${base}/guide/installation` },
        { text: 'Vue Plugin', link: `${base}/guide/vue-plugin` },
        { text: 'Nuxt Module', link: `${base}/guide/nuxt-module` },
      ],
    },
    {
      text: 'Composables',
      items: [
        { text: 'useVueKaspa', link: `${base}/composables/use-vue-kaspa` },
        { text: 'useKaspa', link: `${base}/composables/use-kaspa` },
        { text: 'useRpc', link: `${base}/composables/use-rpc` },
        { text: 'useKaspaRest', link: `${base}/composables/use-kaspa-rest` },
        { text: 'useUtxo', link: `${base}/composables/use-utxo` },
        { text: 'useTransaction', link: `${base}/composables/use-transaction` },
        { text: 'useCrypto', link: `${base}/composables/use-crypto` },
        { text: 'useNetwork', link: `${base}/composables/use-network` },
        { text: 'useWallet', link: `${base}/composables/use-wallet` },
        { text: 'useBlockListener', link: `${base}/composables/use-block-listener` },
        { text: 'useTransactionListener', link: `${base}/composables/use-transaction-listener` },
      ],
    },
    {
      text: 'Components',
      items: [
        { text: 'ConnectWallet', link: `${base}/components/connect-wallet` },
      ],
    },
    {
      text: t('Reference', 'Referensi', 'リファレンス', '參考'),
      items: [
        { text: t('TypeScript Types', 'Tipe TypeScript', 'TypeScript 型', 'TypeScript 型別'), link: `${base}/reference/types` },
        { text: t('Constants', 'Konstanta', '定数', '常量'), link: `${base}/reference/constants` },
        { text: t('Changelog', 'Catatan Perubahan', '変更履歴', '更新日誌'), link: `${base}/reference/changelog` },
      ],
    },
    {
      text: 'AI & LLMs',
      items: [
        { text: t('Overview', 'Ringkasan', '概要', '概覽'), link: '/llms/' },
      ],
    },
    {
      text: t('Advanced', 'Lanjutan', '上級', '進階'),
      collapsed: true,
      items: [
        { text: 'Vue DevTools', link: `${base}/guide/devtools` },
        { text: t('Error Handling', 'Penanganan Error', 'エラー処理', '錯誤處理'), link: `${base}/guide/error-handling` },
      ],
    },
  ]

  return items
}

export default defineConfig({
  title: 'Vue Kaspa',
  description: 'Vue 3 composables and Nuxt module for the Kaspa blockchain',

  head: [
    ['link', { rel: 'icon', href: '/logo.png', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#70C7BA' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'vue-kaspa' }],
    ['meta', { property: 'og:title', content: 'vue-kaspa — Vue 3 composables for Kaspa blockchain' }],
    ['meta', { property: 'og:description', content: 'Vue 3 composables and Nuxt 4 module for building Kaspa blockchain apps. Auto-imports, WASM handled, scaffold in seconds with npx vue-kaspa-cli.' }],
    ['meta', { property: 'og:url', content: 'https://vue-kaspa.vercel.app' }],
    ['meta', { property: 'og:image', content: 'https://vue-kaspa.vercel.app/og.png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'vue-kaspa — Vue 3 composables for Kaspa blockchain' }],
    ['meta', { name: 'twitter:description', content: 'Vue 3 composables and Nuxt 4 module for building Kaspa blockchain apps. Auto-imports, WASM handled, scaffold in seconds with npx vue-kaspa-cli.' }],
    ['meta', { name: 'twitter:image', content: 'https://vue-kaspa.vercel.app/og.png' }],
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: nav(''),
        sidebar: sidebar(''),
      },
    },
    id: {
      label: 'Bahasa Indonesia',
      lang: 'id-ID',
      themeConfig: {
        nav: nav('id'),
        sidebar: sidebar('id'),
      },
    },
    ja: {
      label: '日本語',
      lang: 'ja-JP',
      themeConfig: {
        nav: nav('ja'),
        sidebar: sidebar('ja'),
      },
    },
    'zh-TW': {
      label: '繁體中文',
      lang: 'zh-TW',
      themeConfig: {
        nav: nav('zh-TW'),
        sidebar: sidebar('zh-TW'),
      },
    },
  },

  themeConfig: {
    logo: '/logo.png',
    siteTitle: 'Vue Kaspa',

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

  ignoreDeadLinks: true,

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'one-dark-pro',
    },
  },
})
