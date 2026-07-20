/// <reference types="bun-types" />
import { describe, test, expect } from 'bun:test'
import { z } from 'zod'
import { parseAiBody } from './route-validation'

const TestSchema = z.object({
  message: z.string().min(1).max(10),
  count: z.number().int().min(1).max(5),
})

const makeRequest = (body: unknown, headers: Record<string, string> = {}): Request => {
  const text = typeof body === 'string' ? body : JSON.stringify(body)
  return new Request('https://example.com/api/ai/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: text,
  })
}

describe('parseAiBody', () => {
  test('returns ok:true with parsed data for a valid body', async () => {
    const result = await parseAiBody(makeRequest({ message: 'hi', count: 2 }), TestSchema)
    expect(result.ok).toBe(true)
    if (result.ok === true) {
      expect(result.data.message).toBe('hi')
      expect(result.data.count).toBe(2)
    }
  })

  test('returns 400 on malformed JSON', async () => {
    const req = new Request('https://example.com/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json{',
    })
    const result = await parseAiBody(req, TestSchema)
    expect(result.ok).toBe(false)
    if (result.ok === false) expect(result.response.status).toBe(400)
  })

  test('returns 400 on schema mismatch (message too long)', async () => {
    const result = await parseAiBody(
      makeRequest({ message: 'x'.repeat(11), count: 1 }),
      TestSchema,
    )
    expect(result.ok).toBe(false)
    if (result.ok === false) {
      expect(result.response.status).toBe(400)
      const body = await result.response.json()
      expect(body.error).toBe('Invalid request')
      expect(Array.isArray(body.issues)).toBe(true)
    }
  })

  test('returns 400 on schema mismatch (count out of range)', async () => {
    const result = await parseAiBody(
      makeRequest({ message: 'hi', count: 99 }),
      TestSchema,
    )
    expect(result.ok).toBe(false)
    if (result.ok === false) expect(result.response.status).toBe(400)
  })

  test('returns 413 when Content-Length header exceeds cap', async () => {
    // Lie about Content-Length to trigger the header pre-check without
    // actually sending a huge body.
    const result = await parseAiBody(
      makeRequest({ message: 'hi', count: 1 }, { 'content-length': '999999' }),
      TestSchema,
    )
    expect(result.ok).toBe(false)
    if (result.ok === false) expect(result.response.status).toBe(413)
  })

  test('returns 413 when actual body size exceeds cap', async () => {
    // Build a body that is larger than the 100_000-char cap. The header is
    // absent (Request doesn't always set it), so the cap is enforced after
    // the read via rawText.length.
    const huge = 'x'.repeat(100_001)
    const result = await parseAiBody(
      makeRequest({ message: huge, count: 1 }),
      // Loosen the schema so the size check is the only thing that can fail.
      z.object({ message: z.string(), count: z.number() }),
    )
    expect(result.ok).toBe(false)
    if (result.ok === false) expect(result.response.status).toBe(413)
  })

  test('rejects a non-object top-level body (array)', async () => {
    const result = await parseAiBody(makeRequest([1, 2, 3]), TestSchema)
    expect(result.ok).toBe(false)
    if (result.ok === false) expect(result.response.status).toBe(400)
  })
})
