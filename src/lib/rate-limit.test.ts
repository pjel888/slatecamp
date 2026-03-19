import { describe, test, expect } from "bun:test"
import { checkRateLimit } from "./rate-limit"

describe("checkRateLimit", () => {
  test("allows first request", () => {
    const result = checkRateLimit("test-user-1")
    expect(result.allowed).toBe(true)
  })

  test("allows up to 10 requests in a window", () => {
    const key = "test-user-burst-" + Date.now()
    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit(key)
      expect(result.allowed).toBe(true)
    }
  })

  test("blocks 11th request in same window", () => {
    const key = "test-user-block-" + Date.now()
    for (let i = 0; i < 10; i++) {
      checkRateLimit(key)
    }
    const result = checkRateLimit(key)
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  test("different keys have separate limits", () => {
    const key1 = "user-a-" + Date.now()
    const key2 = "user-b-" + Date.now()
    for (let i = 0; i < 10; i++) {
      checkRateLimit(key1)
    }
    const result = checkRateLimit(key2)
    expect(result.allowed).toBe(true)
  })

  test("returns retryAfter as a positive integer when blocked", () => {
    const key = "test-retry-after-" + Date.now()
    for (let i = 0; i < 10; i++) {
      checkRateLimit(key)
    }
    const result = checkRateLimit(key)
    expect(result.allowed).toBe(false)
    expect(typeof result.retryAfter).toBe("number")
    // retryAfter is in seconds and must be within a 60-second window
    expect(result.retryAfter!).toBeGreaterThan(0)
    expect(result.retryAfter!).toBeLessThanOrEqual(60)
  })

  test("first request in a new key does not include retryAfter", () => {
    const key = "test-no-retry-" + Date.now()
    const result = checkRateLimit(key)
    expect(result.allowed).toBe(true)
    expect(result.retryAfter).toBeUndefined()
  })

  test("10th request (boundary) is still allowed", () => {
    const key = "test-boundary-" + Date.now()
    let lastResult = { allowed: false }
    for (let i = 0; i < 10; i++) {
      lastResult = checkRateLimit(key)
    }
    expect(lastResult.allowed).toBe(true)
  })

  test("12th request in same window is also blocked", () => {
    const key = "test-beyond-block-" + Date.now()
    for (let i = 0; i < 12; i++) {
      checkRateLimit(key)
    }
    const result = checkRateLimit(key)
    expect(result.allowed).toBe(false)
  })

  test("unique keys at scale do not interfere with each other", () => {
    const base = "test-scale-" + Date.now()
    for (let u = 0; u < 5; u++) {
      const key = `${base}-user-${u}`
      for (let i = 0; i < 10; i++) {
        const r = checkRateLimit(key)
        expect(r.allowed).toBe(true)
      }
      // 11th call for this user should be blocked
      expect(checkRateLimit(key).allowed).toBe(false)
    }
  })
})
