import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'

/**
 * Secondary build that produces the Nuxt module entry (dist/nuxt.mjs).
 * Run after the main build so dist/index.d.ts already exists when
 * vite-plugin-dts resolves the 'vue-kaspa' self-import for types.
 */
export default defineConfig({
  plugins: [
    dts({
      rollupTypes: false,
      include: ['src/nuxt.ts'],
      outDir: 'dist',
      tsconfigPath: './tsconfig.build.nuxt.json',
      entryRoot: 'src',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/nuxt.ts'),
      formats: ['es'],
      fileName: () => 'nuxt.mjs',
    },
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      external: [
        'vue',
        'vue-kaspa',
        '@vue/devtools-api',
        '@nuxt/kit',
        /^@nuxt\//,
        /^nuxt/,
      ],
    },
    sourcemap: true,
    minify: false,
  },
  define: {
    __DEV__: "process.env.NODE_ENV !== 'production'",
  },
})
