import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  plugins: [vue(), wasm(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // In dev, resolve vue-kaspa directly from source for instant HMR
      'vue-kaspa': resolve(__dirname, '../packages/vue-kaspa/src/index.ts'),
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
