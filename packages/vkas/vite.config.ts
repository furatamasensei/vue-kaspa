import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      rollupTypes: false,
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'tests/**', 'src/nuxt.ts'],
      tsconfigPath: './tsconfig.build.json',
      entryRoot: 'src',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueKaspa',
      formats: ['es', 'umd'],
      fileName: (format) => `vkas.${format === 'es' ? 'es.js' : 'umd.cjs'}`,
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
