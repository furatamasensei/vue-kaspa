import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import wasm from 'vite-plugin-wasm'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

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
    exclude: ['kaspa-wasm'],
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
})
