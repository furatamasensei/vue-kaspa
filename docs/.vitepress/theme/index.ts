import DefaultTheme from 'vitepress/theme'
import { Analytics } from '@vercel/analytics/vue'
import { h } from 'vue'
import './style.css'
import type { Theme } from 'vitepress'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(Analytics),
    })
  },
} satisfies Theme
