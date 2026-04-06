import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { VueKaspa } from '../../src/plugin'
import { useKaspaRest } from '../../src/composables/useKaspaRest'
import { resetWasm } from '../../src/internal/wasm-loader'

function mountUseKaspaRest(pluginOptions = {}, restOptions = {}) {
  let result: ReturnType<typeof useKaspaRest>
  const TestComponent = defineComponent({
    setup() {
      result = useKaspaRest(restOptions)
      return () => null
    },
  })

  const wrapper = mount(TestComponent, {
    global: { plugins: [[VueKaspa, { autoConnect: false, restUrl: 'https://api.test', ...pluginOptions }]] },
    attachTo: document.body,
  })

  return { wrapper, get rest() { return result } }
}

describe('useKaspaRest', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    resetWasm()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('gets a transaction by id and normalizes sender addresses', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([
        {
          transactionId: 'tx-1',
          inputs: [
            { address: 'kaspa:sender-1' },
            { previousOutpoint: { address: 'kaspa:sender-2' } },
          ],
        },
      ]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const { rest } = mountUseKaspaRest()
    const tx = await rest.getTransaction('tx-1')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toContain('/transactions/search')
    expect(tx?.transactionId).toBe('tx-1')
    expect(tx?.senderAddresses).toEqual(['kaspa:sender-1', 'kaspa:sender-2'])
  })

  it('caches repeated address transaction requests', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([
        { transactionId: 'tx-1', inputs: [{ address: 'kaspa:sender-1' }] },
      ]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const { rest } = mountUseKaspaRest()
    const first = await rest.getFullTransactionsByAddress('kaspa:qaddress')
    const second = await rest.getFullTransactionsByAddress('kaspa:qaddress')

    expect(first).toHaveLength(1)
    expect(second).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('uses the configured REST base URL from plugin options', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const { rest } = mountUseKaspaRest({ restUrl: 'https://rest.example' })
    await rest.getHealth()

    expect(fetchMock.mock.calls[0][0]).toBe('https://rest.example/info/health')
  })
})
