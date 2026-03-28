import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'

const isDev = process.env.NODE_ENV !== 'production'

export default defineConfig({
  plugins: [vue(), wasm(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // In dev only: resolve vue-kaspa from source for instant HMR.
      // In production: use the pre-built dist to avoid kaspa-wasm chunk duplication.
      ...(isDev && {
        'vue-kaspa': resolve(__dirname, '../packages/vue-kaspa/src/index.ts'),
      }),
    },
  },
  optimizeDeps: {
    exclude: ['@vue-kaspa/kaspa-wasm'],
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
})
