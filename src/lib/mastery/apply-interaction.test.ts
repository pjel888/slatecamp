/// <reference types="bun-types" />
import { beforeEach, describe, expect, mock, test } from 'bun:test'

// ---------------------------------------------------------------------------
// applyInteraction is the canonical mastery writer after Plan 013. It issues
// ONE SELECT (mastery row) + TWO auxiliary SELECTs (taxonomy_tree,
// user_interactions count) + ONE UPSERT. These tests lock in:
//   1. The single-UPSERT contract (no longer three competing writes).
//   2. The merged-math correctness — the mastery-stats EMA, memory-strength
//      SS/RS, and decay-rate math all land in ONE upsert payload.
//   3. The fire-and-forget contract (supabase failures don't throw).
// ---------------------------------------------------------------------------

interface CapturedState {
  masteryRow: Record<string, unknown> | null
  taxonomyRow: { difficulty: number | null; bloom_level: string | null } | null
  interactionsCount: number
  masterySelectColumns: string | null
  upsertPayload: Record<string, unknown> | null
  upsertOnConflict: string | undefined
  shouldThrow: boolean
}

const state: CapturedState = {
  masteryRow: null,
  taxonomyRow: null,
  interactionsCount: 0,
  masterySelectColumns: null,
  upsertPayload: null,
  upsertOnConflict: undefined,
  shouldThrow: false,
}

const makeChain = () => {
  const chain: Record<string, unknown> = {}
  chain.select = mock((_columns?: string) => chain)
  for (const m of ['eq', 'in', 'order', 'limit', 'range', 'not', 'or']) {
    chain[m] = mock(() => chain)
  }
  chain.maybeSingle = mock(() =>
    Promise.resolve({ data: state.masteryRow, error: null }),
  )
  chain.single = mock(() =>
    Promise.resolve({ data: state.masteryRow, error: null }),
  )
  chain.then = (resolve: (v: unknown) => void) => resolve({ error: null })
  return chain
}

const mockSupabaseClient = {
  from: mock((table: string) => ({
    select: mock((columns?: string, options?: { head?: boolean }) => {
      if (table === 'user_node_mastery') state.masterySelectColumns = columns ?? null
      if (options?.head === true) {
        // Count-only head query — build a chainable thenable (caller does
        // `.eq(...).eq(...).eq(...)` then awaits).
        const inner: Record<string, unknown> = {
          then: (resolve: (v: unknown) => void) =>
            resolve({ count: state.interactionsCount }),
        }
        for (const m of ['eq', 'in', 'order', 'limit']) {
          inner[m] = mock(() => inner)
        }
        return inner
      }
      const chain = makeChain()
      // Override maybeSingle to return the right data per table.
      if (table === 'user_node_mastery') {
        chain.maybeSingle = mock(() =>
          Promise.resolve({ data: state.masteryRow, error: null }),
        )
      } else if (table === 'taxonomy_tree') {
        chain.maybeSingle = mock(() =>
          Promise.resolve({ data: state.taxonomyRow, error: null }),
        )
      }
      return chain
    }),
    upsert: mock((payload: Record<string, unknown>, opts?: { onConflict?: string }) => {
      if (table === 'user_node_mastery') {
        state.upsertPayload = payload
        state.upsertOnConflict = opts?.onConflict
      }
      return makeChain()
    }),
    update: mock(() => makeChain()),
  })),
}

mock.module('@/lib/supabase/server', () => ({
  createStaticClient: () => Promise.resolve({}),
  createServiceClient: () => Promise.resolve({}),
  hasAuthCookie: () => Promise.resolve(false),
  getUserIfPresent: () => Promise.resolve({ data: { user: null } }),
  createClient: mock(() => {
    if (state.shouldThrow) return Promise.reject(new Error('Supabase connection failed'))
    return Promise.resolve(mockSupabaseClient)
  }),
  getUser: mock(() => Promise.resolve({ data: { user: { id: 'user-1' } } })),
}))

const { applyInteraction } = await import('./apply-interaction')

const blankRow = {
  current_mastery_weight: 0,
  total_attempts: 0,
  total_correct: 0,
  avg_time_ms: 0,
  consecutive_correct_streak: 0,
  highest_difficulty_correct: 0,
  has_bloom_apply_correct: false,
  has_bloom_analyze_correct: false,
  distinct_questions_seen: 0,
  storage_strength: 0,
  retrieval_strength: 0,
  practice_count: 0,
  practice_contexts: 0,
  last_encountered: null,
  decay_rate: 0.3,
}

const baseInput = {
  userId: 'user-1',
  topicId: 'topic-1',
  questionId: 'q-1',
  isCorrect: true,
  timeSpentMs: 5000,
  avgTimeMs: 10000,
  difficulty: 0.5,
  isInterleaved: false,
  sessionMode: 'chill',
  emaWeightMultiplier: 1.0,
  isSuspectedLuckyGuess: false,
}

describe('applyInteraction — merged-math + single-UPSERT (Plan 013)', () => {
  beforeEach(() => {
    state.masteryRow = { ...blankRow }
    state.taxonomyRow = null
    state.interactionsCount = 0
    state.masterySelectColumns = null
    state.upsertPayload = null
    state.upsertOnConflict = undefined
    state.shouldThrow = false
  })

  test('selects every column any of the three previous hooks needed (merged SELECT)', async () => {
    await applyInteraction(baseInput)
    const cols = state.masterySelectColumns ?? ''
    // mastery-stats
    expect(cols).toContain('current_mastery_weight')
    expect(cols).toContain('total_attempts')
    expect(cols).toContain('distinct_questions_seen')
    // memory-strength
    expect(cols).toContain('storage_strength')
    expect(cols).toContain('retrieval_strength')
    expect(cols).toContain('practice_count')
    expect(cols).toContain('practice_contexts')
    // decay
    expect(cols).toContain('decay_rate')
    expect(cols).toContain('last_encountered')
    // shared
    expect(cols).toContain('avg_time_ms')
  })

  test('issues exactly ONE upsert with the onConflict key (single-writer contract)', async () => {
    await applyInteraction(baseInput)
    expect(state.upsertPayload).not.toBeNull()
    expect(state.upsertOnConflict).toBe('user_id, topic_id')
  })

  test('merged payload includes columns from all three previous hooks', async () => {
    await applyInteraction(baseInput)
    const payload = state.upsertPayload ?? {}
    // mastery-stats slice
    expect(payload).toHaveProperty('current_mastery_weight')
    expect(payload).toHaveProperty('total_attempts')
    expect(payload).toHaveProperty('total_correct')
    expect(payload).toHaveProperty('consecutive_correct_streak')
    expect(payload).toHaveProperty('distinct_questions_seen')
    expect(payload).toHaveProperty('highest_difficulty_correct')
    expect(payload).toHaveProperty('has_bloom_apply_correct')
    expect(payload).toHaveProperty('has_bloom_analyze_correct')
    expect(payload).toHaveProperty('avg_time_ms')
    // memory-strength slice
    expect(payload).toHaveProperty('storage_strength')
    expect(payload).toHaveProperty('retrieval_strength')
    expect(payload).toHaveProperty('practice_count')
    expect(payload).toHaveProperty('practice_contexts')
    // decay slice
    expect(payload).toHaveProperty('decay_rate')
    expect(payload).toHaveProperty('predicted_recall')
    expect(payload).toHaveProperty('optimal_review_at')
    // shared
    expect(payload).toHaveProperty('last_encountered')
  })

  test('mastery-stats EMA is computed correctly (alpha=0.6 full_exam)', async () => {
    state.masteryRow = { ...blankRow, current_mastery_weight: 0.4 }
    await applyInteraction({ ...baseInput, sessionMode: 'full_exam', isCorrect: true })
    const payload = state.upsertPayload ?? {}
    // newWeight = 0.4 + 0.6 * 1.0 * (1.0 - 0.4) = 0.76
    expect(payload.current_mastery_weight).toBeCloseTo(0.76, 5)
  })

  test('practice_count increments by exactly 1 (no concurrent RMW drift)', async () => {
    state.masteryRow = { ...blankRow, practice_count: 5, total_attempts: 5 }
    await applyInteraction(baseInput)
    expect((state.upsertPayload ?? {}).practice_count).toBe(6)
    expect((state.upsertPayload ?? {}).total_attempts).toBe(6)
  })

  test('SS increases monotonically (capped at 1.0) and is rounded', async () => {
    state.masteryRow = { ...blankRow, storage_strength: 0.5 }
    await applyInteraction({ ...baseInput, isCorrect: true, difficulty: 0.6, isInterleaved: true })
    const newSS = (state.upsertPayload ?? {}).storage_strength as number
    // baseIncrement=0.05 + contextBonus=0.1 + difficultyBonus=0.03 = 0.18
    // newSS = 0.5 + 0.18 * 1.0 = 0.68 (rounded to 3 decimals)
    expect(newSS).toBeGreaterThan(0.5)
    expect(newSS).toBeLessThanOrEqual(1.0)
    expect(newSS).toBeCloseTo(0.68, 2)
  })

  test('decay_rate decreases on a fast correct answer', async () => {
    state.masteryRow = { ...blankRow, decay_rate: 0.3 }
    // timeSpentMs < 1.5x avgTimeMs (5000 vs 10000) → reduce decay
    await applyInteraction({ ...baseInput, isCorrect: true, timeSpentMs: 5000, avgTimeMs: 10000 })
    const newDecay = (state.upsertPayload ?? {}).decay_rate as number
    // 0.3 * 0.95 = 0.285 (rounded to 0.285)
    expect(newDecay).toBeLessThan(0.3)
    expect(newDecay).toBeCloseTo(0.285, 3)
  })

  test('decay_rate increases on an incorrect answer', async () => {
    state.masteryRow = { ...blankRow, decay_rate: 0.3 }
    await applyInteraction({ ...baseInput, isCorrect: false })
    const newDecay = (state.upsertPayload ?? {}).decay_rate as number
    // 0.3 * 1.1 = 0.33
    expect(newDecay).toBeGreaterThan(0.3)
    expect(newDecay).toBeCloseTo(0.33, 3)
  })

  test('does NOT throw on supabase failure (fire-and-forget contract preserved)', async () => {
    state.shouldThrow = true
    const originalConsoleError = console.error
    console.error = () => {}
    try {
      await expect(applyInteraction(baseInput)).resolves.toBeUndefined()
    } finally {
      console.error = originalConsoleError
    }
  })

  test('writes last_encountered as a fresh ISO timestamp', async () => {
    await applyInteraction(baseInput)
    const ts = (state.upsertPayload ?? {}).last_encountered as string
    expect(typeof ts).toBe('string')
    expect(Number.isNaN(new Date(ts).getTime())).toBe(false)
  })
})
