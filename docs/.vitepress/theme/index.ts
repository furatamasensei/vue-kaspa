import DefaultTheme from 'vitepress/theme'
import { Analytics } from '@vercel/analytics/vue'
import DonateButton from './DonateButton.vue'
import PackageManagerTabs from './PackageManagerTabs.vue'
import { h } from 'vue'
import './style.css'
import type { Theme } from 'vitepress'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(Analytics),
      'nav-bar-content-after': () => h(DonateButton),
    })
  },
  enhanceApp({ app }) {
    app.component('PackageManagerTabs', PackageManagerTabs)
  },
} satisfies Theme
