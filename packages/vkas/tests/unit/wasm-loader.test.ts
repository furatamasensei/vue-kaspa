import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockWasmInit, initConsolePanicHook, initBrowserPanicHook } from '../mocks/kaspa-wasm'
import { ensureWasmInit, getWasmState, resetWasm } from '../../src/internal/wasm-loader'

describe('wasm-loader', () => {
  beforeEach(() => {
    resetWasm()
  })

  it('starts in idle state', () => {
    expect(getWasmState().status).toBe('idle')
  })

  it('transitions to loading then ready on ensureWasmInit()', async () => {
    const promise = ensureWasmInit({})
    expect(getWasmState().status).toBe('loading')
    await promise
    expect(getWasmState().status).toBe('ready')
  })

  it('is idempotent — second call resolves immediately without re-init', async () => {
    await ensureWasmInit({})
    await ensureWasmInit({})
    expect(mockWasmInit).toHaveBeenCalledTimes(1)
  })

  it('concurrent calls share a single init promise', async () => {
    await Promise.all([ensureWasmInit({}), ensureWasmInit({}), ensureWasmInit({})])
    expect(mockWasmInit).toHaveBeenCalledTimes(1)
  })

  it('installs console panic hook by default', async () => {
    await ensureWasmInit({ panicHook: 'console' })
    expect(initConsolePanicHook).toHaveBeenCalledTimes(1)
    expect(initBrowserPanicHook).not.toHaveBeenCalled()
  })

  it('installs browser panic hook when configured', async () => {
    await ensureWasmInit({ panicHook: 'browser' })
    expect(initBrowserPanicHook).toHaveBeenCalledTimes(1)
    expect(initConsolePanicHook).not.toHaveBeenCalled()
  })

  it('skips panic hook when panicHook is false', async () => {
    await ensureWasmInit({ panicHook: false })
    expect(initConsolePanicHook).not.toHaveBeenCalled()
    expect(initBrowserPanicHook).not.toHaveBeenCalled()
  })

  it('transitions to error state on init failure', async () => {
    mockWasmInit.mockRejectedValueOnce(new Error('WASM fetch failed'))
    await expect(ensureWasmInit({})).rejects.toThrow('WASM fetch failed')
    expect(getWasmState().status).toBe('error')
    expect(getWasmState().error).toBeInstanceOf(Error)
  })

  it('allows retry after error', async () => {
    mockWasmInit.mockRejectedValueOnce(new Error('WASM fetch failed'))
    await expect(ensureWasmInit({})).rejects.toThrow()
    // After failure, resetWasm is called internally (initPromise = null)
    // Now it can be retried:
    await ensureWasmInit({})
    expect(getWasmState().status).toBe('ready')
    expect(mockWasmInit).toHaveBeenCalledTimes(2)
  })

  it('resetWasm() returns state to idle', async () => {
    await ensureWasmInit({})
    resetWasm()
    expect(getWasmState().status).toBe('idle')
    expect(getWasmState().error).toBeNull()
  })
})
