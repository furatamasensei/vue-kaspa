import { describe, expect, it } from 'vitest'
import { formatHash } from '../../src/utils/hash'

const LONG_HASH = '0123456789abcdef'.repeat(4)

describe('formatHash', () => {
  it('adds the default block hash label as a suffix', () => {
    const formatted = formatHash(LONG_HASH, 'block')
    expect(formatted).toContain('(Block hash)')
    expect(formatted).toContain('0123456789ab')
  })

  it('switches to prefix labels when requested', () => {
    const formatted = formatHash(LONG_HASH, 'transaction', {
      labelPosition: 'prefix',
      truncate: false,
    })
    expect(formatted).toMatch(/^Transaction ID:/)
    expect(formatted).toContain(LONG_HASH)
  })

  it('truncates the hash when truncate option is enabled', () => {
    const formatted = formatHash(LONG_HASH, 'block', { truncate: 4 })
    expect(formatted).toContain('0123…cdef')
    expect(formatted).toContain('(Block hash)')
  })
})
