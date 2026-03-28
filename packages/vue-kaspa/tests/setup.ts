import { vi } from 'vitest'

// Global mock for @vue-kaspa/kaspa-wasm is handled by vitest.config.ts resolve alias
// Additional global setup can go here

// Suppress console.error for expected Vue warnings in tests
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})
afterEach(() => {
  console.error = originalConsoleError
})
