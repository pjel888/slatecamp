// ─── Median Time Helper ───────────────────────────────────────────────────────
// Returns median time_spent_ms for a given difficulty band.
// Difficulty bands: 0–0.3 (easy), 0.3–0.6 (medium), 0.6–1.0 (hard)
// Uses a simple in-memory cache since aggregate times change slowly.

import { createClient } from '@/lib/supabase/server'

interface CacheEntry {
  value: number
  expiresAt: number
}

const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes
const cache = new Map<string, CacheEntry>()

/** Map a difficulty value (0–1) to its band key */
const getBandKey = (difficulty: number): string => {
  if (difficulty < 0.3) return 'easy'
  if (difficulty < 0.6) return 'medium'
  return 'hard'
}

/** Get the lower/upper bounds for a difficulty band */
const getBandRange = (bandKey: string): [number, number] => {
  switch (bandKey) {
    case 'easy':
      return [0, 0.3]
    case 'medium':
      return [0.3, 0.6]
    case 'hard':
    default:
      return [0.6, 1.0]
  }
}

/**
 * Fetch the median time_spent_ms for questions in the same difficulty band.
 * Falls back to a sensible default (15s for easy, 30s for medium, 45s for hard)
 * when there's insufficient data.
 */
export const getMedianTimeForDifficulty = async (
  difficulty: number,
): Promise<number> => {
  const bandKey = getBandKey(difficulty)

  // Check cache
  const cached = cache.get(bandKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  const [lower, upper] = getBandRange(bandKey)

  try {
    const supabase = await createClient()

    // Query median via percentile_cont — Supabase/Postgres supports this via RPC
    // or we can approximate by ordering and picking the middle value.
    // Using a direct query with ordering for broad compatibility.
    const { data, error } = await supabase
      .from('user_interactions')
      .select('time_spent_ms, questions!inner(difficulty)')
      .gte('questions.difficulty', lower)
      .lt('questions.difficulty', upper)
      .not('time_spent_ms', 'is', null)
      .gt('time_spent_ms', 0)
      .order('time_spent_ms', { ascending: true })
      .limit(1000)

    if (error || !data || data.length === 0) {
      const fallback = getFallbackMedian(bandKey)
      cache.set(bandKey, { value: fallback, expiresAt: Date.now() + CACHE_TTL_MS })
      return fallback
    }

    // Pick the middle element as median
    const times = data.map((row: { time_spent_ms: number | null }) => row.time_spent_ms ?? 0).filter(Boolean)
    const median = times.length > 0
      ? times[Math.floor(times.length / 2)]
      : getFallbackMedian(bandKey)

    cache.set(bandKey, { value: median, expiresAt: Date.now() + CACHE_TTL_MS })
    return median
  } catch {
    const fallback = getFallbackMedian(bandKey)
    cache.set(bandKey, { value: fallback, expiresAt: Date.now() + CACHE_TTL_MS })
    return fallback
  }
}

/** Sensible defaults when there's no data yet */
const getFallbackMedian = (bandKey: string): number => {
  switch (bandKey) {
    case 'easy':
      return 15_000
    case 'medium':
      return 30_000
    case 'hard':
    default:
      return 45_000
  }
}
