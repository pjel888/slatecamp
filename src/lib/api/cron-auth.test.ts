import { describe, expect, test } from 'bun:test'
import { verifyCronRequest } from './cron-auth'

describe('verifyCronRequest', () => {
  test('fails closed when CRON_SECRET is missing', async () => {
    const result = verifyCronRequest('Bearer undefined', null)

    expect(result.ok).toBe(false)
    if (result.ok === false) {
      expect(result.status).toBe(500)
      expect(result.response.status).toBe(500)
      await expect(result.response.json()).resolves.toEqual({
        error: 'Cron authentication is not configured',
      })
    }
  })

  test('fails closed when CRON_SECRET is empty or whitespace', () => {
    expect(verifyCronRequest('Bearer ', '').ok).toBe(false)
    expect(verifyCronRequest('Bearer ', '   ').ok).toBe(false)
  })

  test('rejects wrong Authorization header', async () => {
    const result = verifyCronRequest('Bearer wrong-secret', 'expected-secret')

    expect(result.ok).toBe(false)
    if (result.ok === false) {
      expect(result.status).toBe(401)
      expect(result.response.status).toBe(401)
      await expect(result.response.json()).resolves.toEqual({ error: 'Unauthorized' })
    }
  })

  test('rejects empty, null-like, and malformed bearer tokens', () => {
    expect(verifyCronRequest(null, 'expected-secret').ok).toBe(false)
    expect(verifyCronRequest('', 'expected-secret').ok).toBe(false)
    expect(verifyCronRequest('Bearer', 'expected-secret').ok).toBe(false)
    expect(verifyCronRequest('Bearer ', 'expected-secret').ok).toBe(false)
    expect(verifyCronRequest('Bearer undefined', 'expected-secret').ok).toBe(false)
    expect(verifyCronRequest('Bearer null', 'expected-secret').ok).toBe(false)
  })

  test('accepts the exact configured Authorization header', () => {
    expect(verifyCronRequest('Bearer expected-secret', 'expected-secret')).toEqual({ ok: true })
  })
})
