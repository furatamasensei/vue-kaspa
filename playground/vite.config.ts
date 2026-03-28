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
      // In dev, resolve vkas directly from source for instant HMR
      'vkas': resolve(__dirname, '../packages/vkas/src/index.ts'),
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
