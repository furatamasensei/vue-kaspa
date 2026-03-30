import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [vue(), wasm(), tailwindcss(), ...(isDev ? [vueDevTools()] : [])],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        // In dev only: resolve vue-kaspa from source for instant HMR.
        // In production: use the pre-built dist.
        ...(isDev && {
          'vue-kaspa/style': resolve(__dirname, '../packages/vue-kaspa/src/style.css'),
          'vue-kaspa': resolve(__dirname, '../packages/vue-kaspa/src/index.ts'),
        }),
      },
    },
    optimizeDeps: {
      exclude: ['@vue-kaspa/kaspa-wasm'],
    },
    server: {
      headers: {
        'Cross-Origin-Embedder-Policy': 'credentialless',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Keep kaspa-wasm bindings in a single dedicated chunk so all
          // dynamic imports of @vue-kaspa/kaspa-wasm share one module
          // evaluation and thus one set of class references.
          manualChunks(id) {
            if (
              id.includes('@vue-kaspa/kaspa-wasm') ||
              id.includes('vendor/kaspa-wasm')
            ) {
              return 'kaspa-wasm'
            }
          },
        },
      },
    },
  }
})
