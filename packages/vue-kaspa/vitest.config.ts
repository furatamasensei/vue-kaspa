import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    name: 'vue-kaspa',
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**'],
      exclude: ['src/devtools/**'],
    },
  },
  resolve: {
    alias: {
      '@vue-kaspa/kaspa-wasm': resolve(__dirname, './tests/mocks/kaspa-wasm.ts'),
    },
  },
  define: {
    __DEV__: 'true',
  },
})
