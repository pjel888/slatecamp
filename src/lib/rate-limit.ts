/**
 * Per-user sliding-window rate limiter for AI routes.
 *
 * BACKEND SELECTION (automatic):
 *   - When `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set
 *     (production on Vercel), uses Upstash Redis REST. The limit is then
 *     shared across ALL serverless instances — the correct behavior on a
 *     horizontally-scaled fleet where module-local state is per-instance.
 *   - Otherwise (local dev, tests, preview without Redis), falls back to an
 *     in-memory Map. Same per-key/per-window semantics, just per-process.
 *
 * The async API (`await checkRateLimit(key)`) is forced by the Redis path;
 * the in-memory path is also async for a uniform caller contract. The
 * previous sync API was a footgun — it could not be backed by Redis.
 *
 * The cap is configurable via `AI_RATE_LIMIT_PER_MINUTE` (default 10).
 *
 * `@upstash/redis` is an OPTIONAL dependency: it is only required in
 * environments that set the Upstash env vars. The dynamic import below is
 * wrapped in try/catch so a missing package gracefully degrades to in-mem.
 * Production deployments that want the shared Redis backend run
 * `bun add @upstash/redis` and set the env vars — no code change required.
 */

const WINDOW_SECONDS = 60
const MAX_REQUESTS = Number(process.env.AI_RATE_LIMIT_PER_MINUTE ?? '10')

export interface RateLimitResult {
  allowed: boolean
  retryAfter?: number
}

// ---- Upstash Redis client (lazily resolved) ---------------------------------

interface UpstashLike {
  incr: (key: string) => Promise<number>
  expire: (key: string, seconds: number) => Promise<number>
  ttl: (key: string) => Promise<number>
}

let cachedRedis: UpstashLike | null | undefined = undefined

async function resolveRedis(): Promise<UpstashLike | null> {
  if (cachedRedis !== undefined) return cachedRedis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    cachedRedis = null
    return null
  }
  // Dynamic import so the package is only required when Redis is configured.
  // No hard dependency in package.json — production deployments provision
  // Upstash and `bun add @upstash/redis` at that point. The dynamic import is
  // wrapped in try/catch so a missing package gracefully degrades to in-mem.
  try {
    // @ts-expect-error — optional peer dependency; not installed in dev.
    const mod = (await import('@upstash/redis')) as {
      Redis: new (opts: { url: string; token: string }) => UpstashLike
    }
    cachedRedis = new mod.Redis({ url, token })
  } catch {
    console.warn(
      '[rate-limit] UPSTASH_REDIS_REST_URL is set but @upstash/redis could not be loaded — falling back to in-memory. ' +
        'Run `bun add @upstash/redis` to enable the shared Redis backend.',
    )
    cachedRedis = null
  }
  return cachedRedis
}

// ---- In-memory fallback ----------------------------------------------------

interface MemoryWindow {
  count: number
  resetAt: number // epoch ms
}

const memoryStore = new Map<string, MemoryWindow>()

async function checkMemory(key: string): Promise<RateLimitResult> {
  const now = Date.now()
  const resetAt = now + WINDOW_SECONDS * 1000
  const entry = memoryStore.get(key)

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt })
    return { allowed: true }
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  entry.count += 1
  return { allowed: true }
}

async function checkRedis(key: string, redis: UpstashLike): Promise<RateLimitResult> {
  // Atomic INCR + EXPIRE. The first request in a window sets the TTL.
  // Returns the new count after increment.
  const redisKey = `ratelimit:${key}`
  const count = await redis.incr(redisKey)
  if (count === 1) {
    await redis.expire(redisKey, WINDOW_SECONDS)
  }
  if (count > MAX_REQUESTS) {
    const ttl = await redis.ttl(redisKey)
    return {
      allowed: false,
      // TTL is in seconds; if it's missing/negative, fall back to full window.
      retryAfter: ttl > 0 ? ttl : WINDOW_SECONDS,
    }
  }
  return { allowed: true }
}

// ---- Public API ------------------------------------------------------------

export const checkRateLimit = async (key: string): Promise<RateLimitResult> => {
  const redis = await resolveRedis()
  if (redis) {
    try {
      return await checkRedis(key, redis)
    } catch (err) {
      // Redis errors must NOT break the request — degrade to in-memory and
      // continue. The cap is then per-instance for the duration of the
      // outage, which is still better than 500-ing the user's request.
      console.error('[rate-limit] Redis check failed; falling back to in-memory for this call:', err)
    }
  }
  return checkMemory(key)
}
