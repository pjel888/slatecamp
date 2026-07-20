/// <reference types="bun-types" />
import { describe, test, expect, beforeEach } from "bun:test"
import { checkRateLimit } from "./rate-limit"

// These tests exercise the in-memory fallback path. UPSTASH_REDIS_REST_URL is
// not set in the test environment, so `resolveRedis()` returns null and the
// implementation falls back to the per-process Map.

describe("checkRateLimit (in-memory fallback)", () => {
  // Per-process Map means tests share state; clear it between tests to keep
  // assertions independent. (The Map is module-local — not exported — so we
  // rely on unique keys per test instead. The unique-key approach also makes
  // each test self-contained.)
  beforeEach(() => {
    // No-op: unique keys per test make this unnecessary, but keeping the
    // hook documents the assumption.
  })

  test("allows first request", async () => {
    const result = await checkRateLimit("test-user-1-" + Date.now())
    expect(result.allowed).toBe(true)
  })

  test("allows up to 10 requests in a window", async () => {
    const key = "test-user-burst-" + Date.now()
    for (let i = 0; i < 10; i++) {
      const result = await checkRateLimit(key)
      expect(result.allowed).toBe(true)
    }
  })

  test("blocks 11th request in same window", async () => {
    const key = "test-user-block-" + Date.now()
    for (let i = 0; i < 10; i++) {
      await checkRateLimit(key)
    }
    const result = await checkRateLimit(key)
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  test("different keys have separate limits", async () => {
    const key1 = "user-a-" + Date.now()
    const key2 = "user-b-" + Date.now()
    for (let i = 0; i < 10; i++) {
      await checkRateLimit(key1)
    }
    const result = await checkRateLimit(key2)
    expect(result.allowed).toBe(true)
  })

  test("returns retryAfter as a positive integer when blocked", async () => {
    const key = "test-retry-after-" + Date.now()
    for (let i = 0; i < 10; i++) {
      await checkRateLimit(key)
    }
    const result = await checkRateLimit(key)
    expect(result.allowed).toBe(false)
    expect(typeof result.retryAfter).toBe("number")
    // retryAfter is in seconds and must be within a 60-second window
    expect(result.retryAfter!).toBeGreaterThan(0)
    expect(result.retryAfter!).toBeLessThanOrEqual(60)
  })

  test("first request in a new key does not include retryAfter", async () => {
    const key = "test-no-retry-" + Date.now()
    const result = await checkRateLimit(key)
    expect(result.allowed).toBe(true)
    expect(result.retryAfter).toBeUndefined()
  })

  test("10th request (boundary) is still allowed", async () => {
    const key = "test-boundary-" + Date.now()
    let lastResult: { allowed: boolean } = { allowed: false }
    for (let i = 0; i < 10; i++) {
      lastResult = await checkRateLimit(key)
    }
    expect(lastResult.allowed).toBe(true)
  })

  test("12th request in same window is also blocked", async () => {
    const key = "test-beyond-block-" + Date.now()
    for (let i = 0; i < 12; i++) {
      await checkRateLimit(key)
    }
    const result = await checkRateLimit(key)
    expect(result.allowed).toBe(false)
  })

  test("unique keys at scale do not interfere with each other", async () => {
    const base = "test-scale-" + Date.now()
    for (let u = 0; u < 5; u++) {
      const key = `${base}-user-${u}`
      for (let i = 0; i < 10; i++) {
        const r = await checkRateLimit(key)
        expect(r.allowed).toBe(true)
      }
      // 11th call for this user should be blocked
      expect((await checkRateLimit(key)).allowed).toBe(false)
    }
  })
})
