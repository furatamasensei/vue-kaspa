import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  plugins: [vue(), wasm()],
  optimizeDeps: { exclude: ['@vue-kaspa/kaspa-wasm'] },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  build: {
    rollupOptions: {
      output: {
        // kaspa-wasm must live in one chunk — class identity breaks across chunks.
        manualChunks: id => id.includes('@vue-kaspa/kaspa-wasm') ? 'kaspa-wasm' : undefined,
      },
    },
  },
})
