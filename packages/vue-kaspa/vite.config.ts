import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      rollupTypes: true,
      insertTypesEntry: true,
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'tests/**'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueKaspa',
      formats: ['es', 'umd'],
      fileName: (format) => `vue-kaspa.${format === 'es' ? 'es.js' : 'umd.cjs'}`,
    },
    rollupOptions: {
      external: ['vue', 'kaspa-wasm', '@vue/devtools-api'],
      output: {
        globals: {
          vue: 'Vue',
          'kaspa-wasm': 'KaspaWasm',
          '@vue/devtools-api': 'VueDevtoolsApi',
        },
        exports: 'named',
      },
    },
    assetsInlineLimit: 0,
    sourcemap: true,
    minify: false,
  },
  define: {
    __DEV__: "process.env.NODE_ENV !== 'production'",
  },
})
