/**
 * Simple in-memory sliding window rate limiter.
 * For production: replace with Vercel KV or Redis.
 */

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 10   // per user per window

interface Window {
  count: number
  resetAt: number
}

const store = new Map<string, Window>()

export const checkRateLimit = (key: string): { allowed: boolean; retryAfter?: number } => {
  const now = Date.now()
  const window = store.get(key)

  if (!window || now > window.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true }
  }

  if (window.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((window.resetAt - now) / 1000),
    }
  }

  window.count++
  return { allowed: true }
}
