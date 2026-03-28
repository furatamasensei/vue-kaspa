import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [vue(), wasm(), tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        // In dev only: resolve vue-kaspa from source for instant HMR.
        // In production: use the pre-built dist.
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
    build: {
      // kaspa-wasm (wasm-bindgen) embeds class names like "Resolver",
      // "RpcClient" in the WASM binary and validates them via
      // obj.constructor.name at runtime. Vite's minifier renames every
      // unexported class to a single-letter identifier, causing the WASM
      // type check to fail with "object constructor `e` does not match
      // expected class `Resolver`". Disabling minification preserves the
      // original class names. The playground is a demo app; bundle size
      // is not a concern.
      minify: false,
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
