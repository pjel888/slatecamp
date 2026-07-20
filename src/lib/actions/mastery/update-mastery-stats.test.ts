/// <reference types="bun-types" />
import { beforeEach, describe, expect, mock, test } from 'bun:test'

// ---------------------------------------------------------------------------
// Mock state — capture the SELECT shape, the SELECT data returned, and the
// UPSERT payload so tests can assert on all three. Mirrors the pattern in
// src/lib/srs/update.test.ts, but uses a permissive chained-builder so the
// different query shapes inside updateMasteryStats (mastery select with two
// .eq + .maybeSingle, taxonomy_tree select with .eq + .maybeSingle,
// user_interactions count with two .eq + select_count_head) all work.
// ---------------------------------------------------------------------------

interface CapturedQueries {
  // The first column string passed to .select() against `user_node_mastery`.
  masterySelectColumns: string | null
  // The most recent upsert payload against `user_node_mastery`.
  masteryUpsertPayload: Record<string, unknown> | null
  // The count returned by the user_interactions head-count query.
  interactionsCount: number | null
  // The taxonomy_tree row returned.
  taxonomyRow: { difficulty: number | null; bloom_level: string | null } | null
  // The mastery row returned by maybeSingle.
  masteryRow: Record<string, unknown> | null
}

const state: CapturedQueries = {
  masterySelectColumns: null,
  masteryUpsertPayload: null,
  interactionsCount: 0,
  taxonomyRow: null,
  masteryRow: null,
}

// Permissive awaitable chain: any sequence of .eq/.select/.in/.order/etc.
// returns the chain; terminal methods (.maybeSingle, .single, .then, count
// head) resolve to the configured data for the current table.
const makeChain = (table: string): Record<string, unknown> => {
  const chain: Record<string, unknown> = {}

  const termMaybeSingle = () =>
    Promise.resolve({
      data:
        table === 'user_node_mastery'
          ? state.masteryRow
          : table === 'taxonomy_tree'
            ? state.taxonomyRow
            : null,
      error: null,
    })

  // For count-only head queries on user_interactions.
  const termCountHead = () => Promise.resolve({ count: state.interactionsCount })

  // .select(columns, options?) — when called with { count: 'exact', head: true }
  // we resolve as a terminal count after any subsequent .eq() chain.
  const countHeadThenable = () => {
    const inner: Record<string, unknown> = {
      then: (resolve: (v: unknown) => void) => resolve(termCountHead()),
    }
    // Allow further .eq() chains before the await — each returns the thenable.
    for (const m of ['eq', 'in', 'order', 'limit']) {
      inner[m] = mock(() => inner)
    }
    return inner
  }

  chain.select = mock((columns?: string, options?: { count?: string; head?: boolean }) => {
    if (table === 'user_node_mastery' && columns) {
      state.masterySelectColumns = columns
    }
    if (options?.head === true) {
      // Count-only head query — await resolves to { count }, but the caller
      // may chain .eq()/.in()/.order() before awaiting.
      return countHeadThenable()
    }
    return chain
  })

  // .eq, .in, .order, .limit, .range — all continue the chain.
  for (const m of ['eq', 'in', 'order', 'limit', 'range', 'not', 'or']) {
    chain[m] = mock(() => chain)
  }

  // Terminals.
  chain.maybeSingle = mock(() => termMaybeSingle())
  chain.single = mock(() => termMaybeSingle())
  // Awaitable (no terminal call): used by upsert/update chains.
  chain.then = (resolve: (v: unknown) => void) => resolve({ error: null })

  return chain
}

const mockSupabaseClient = {
  from: mock((table: string) => {
    const chain = makeChain(table)
    return {
      select: chain.select,
      // upsert/update return their own awaitable chain that also captures
      // the payload before delegating.
      upsert: mock((payload: Record<string, unknown>) => {
        if (table === 'user_node_mastery') {
          state.masteryUpsertPayload = payload
        }
        return makeChain(table)
      }),
      update: mock(() => makeChain(table)),
    }
  }),
}

mock.module('@/lib/supabase/server', () => ({
  createStaticClient: () => Promise.resolve({}),
  createServiceClient: () => Promise.resolve({}),
  hasAuthCookie: () => Promise.resolve(false),
  getUserIfPresent: () => Promise.resolve({ data: { user: null } }),
  createClient: mock(() => Promise.resolve(mockSupabaseClient)),
  getUser: mock(() => Promise.resolve({ data: { user: { id: 'user-1' } } })),
}))

const { updateMasteryStats } = await import('./update-mastery-stats')

const baseParams = {
  userId: 'user-1',
  topicId: 'topic-1',
  questionId: 'q-1',
  isCorrect: true,
  timeSpentMs: 5000,
  testMode: 'chill',
  difficulty: 0.5,
  isSuspectedLuckyGuess: false,
}

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
}

describe('updateMasteryStats — characterization (Plan 012)', () => {
  beforeEach(() => {
    state.masterySelectColumns = null
    state.masteryUpsertPayload = null
    state.interactionsCount = 0
    state.taxonomyRow = null
    state.masteryRow = { ...blankRow }
  })

  test('selects the documented columns from user_node_mastery', async () => {
    await updateMasteryStats(baseParams)
    const cols = state.masterySelectColumns ?? ''
    expect(cols).toContain('current_mastery_weight')
    expect(cols).toContain('total_attempts')
    expect(cols).toContain('total_correct')
    expect(cols).toContain('consecutive_correct_streak')
    expect(cols).toContain('distinct_questions_seen')
    expect(cols).toContain('avg_time_ms')
    expect(cols).toContain('highest_difficulty_correct')
    expect(cols).toContain('has_bloom_apply_correct')
    expect(cols).toContain('has_bloom_analyze_correct')
  })

  test('defaults prev mastery to 0 when row has nulls', async () => {
    state.masteryRow = { ...blankRow }
    await updateMasteryStats({ ...baseParams, testMode: 'chill' })
    const payload = state.masteryUpsertPayload ?? {}
    // alpha=0.1 (chill), baseWeight=1.0, answerValue=1.0, prevMastery=0
    // newWeight = 0 + 0.1 * 1.0 * (1.0 - 0) = 0.1
    expect(payload.current_mastery_weight).toBeCloseTo(0.1, 5)
    expect(payload.total_attempts).toBe(1)
    expect(payload.total_correct).toBe(1)
    expect(payload.consecutive_correct_streak).toBe(1)
  })

  test('applies EMA alpha=0.6 for full_exam mode', async () => {
    state.masteryRow = { ...blankRow, current_mastery_weight: 0.4, total_attempts: 3, total_correct: 2, avg_time_ms: 6000, consecutive_correct_streak: 1, distinct_questions_seen: 1 }
    await updateMasteryStats({ ...baseParams, testMode: 'full_exam', isCorrect: true })
    const payload = state.masteryUpsertPayload ?? {}
    // newWeight = 0.4 + 0.6 * 1.0 * (1.0 - 0.4) = 0.4 + 0.36 = 0.76
    expect(payload.current_mastery_weight).toBeCloseTo(0.76, 5)
  })

  test('applies EMA alpha=0.4 for storm mode', async () => {
    state.masteryRow = { ...blankRow, current_mastery_weight: 0.5, total_attempts: 1, total_correct: 1, avg_time_ms: 1000, consecutive_correct_streak: 1, distinct_questions_seen: 1 }
    await updateMasteryStats({ ...baseParams, testMode: 'storm', isCorrect: false })
    const payload = state.masteryUpsertPayload ?? {}
    // newWeight = 0.5 + 0.4 * 1.0 * (0.0 - 0.5) = 0.5 - 0.2 = 0.3
    expect(payload.current_mastery_weight).toBeCloseTo(0.3, 5)
  })

  test('applies EMA alpha=0.3 for focus_review mode', async () => {
    state.masteryRow = { ...blankRow, current_mastery_weight: 0.2, total_attempts: 1, total_correct: 0, avg_time_ms: 1000, consecutive_correct_streak: 0, distinct_questions_seen: 1 }
    await updateMasteryStats({ ...baseParams, testMode: 'focus_review', isCorrect: true })
    const payload = state.masteryUpsertPayload ?? {}
    // newWeight = 0.2 + 0.3 * 1.0 * (1.0 - 0.2) = 0.2 + 0.24 = 0.44
    expect(payload.current_mastery_weight).toBeCloseTo(0.44, 5)
  })

  test('halves answer value when isSuspectedLuckyGuess=true', async () => {
    state.masteryRow = { ...blankRow, current_mastery_weight: 0.0, total_attempts: 0, distinct_questions_seen: 0 }
    await updateMasteryStats({
      ...baseParams,
      testMode: 'full_exam',
      isCorrect: true,
      isSuspectedLuckyGuess: true,
    })
    const payload = state.masteryUpsertPayload ?? {}
    // newWeight = 0 + 0.6 * 0.5 * (1.0 - 0) = 0.3
    expect(payload.current_mastery_weight).toBeCloseTo(0.3, 5)
  })

  test('clamps current_mastery_weight to [0, 1]', async () => {
    state.masteryRow = { ...blankRow, current_mastery_weight: 0.95, total_attempts: 10, total_correct: 9, avg_time_ms: 1000, consecutive_correct_streak: 5, highest_difficulty_correct: 1, has_bloom_apply_correct: true, has_bloom_analyze_correct: true, distinct_questions_seen: 5 }
    await updateMasteryStats({ ...baseParams, testMode: 'full_exam', isCorrect: true })
    const payload = state.masteryUpsertPayload ?? {}
    expect(payload.current_mastery_weight as number).toBeGreaterThanOrEqual(0)
    expect(payload.current_mastery_weight as number).toBeLessThanOrEqual(1)
  })

  test('resets streak on incorrect answer', async () => {
    state.masteryRow = { ...blankRow, current_mastery_weight: 0.5, total_attempts: 3, total_correct: 3, avg_time_ms: 1000, consecutive_correct_streak: 3, highest_difficulty_correct: 0.5, distinct_questions_seen: 3 }
    await updateMasteryStats({ ...baseParams, isCorrect: false })
    const payload = state.masteryUpsertPayload ?? {}
    expect(payload.consecutive_correct_streak).toBe(0)
  })

  test('increments streak on correct answer', async () => {
    state.masteryRow = { ...blankRow, current_mastery_weight: 0.5, total_attempts: 3, total_correct: 3, avg_time_ms: 1000, consecutive_correct_streak: 3, highest_difficulty_correct: 0.5, distinct_questions_seen: 3 }
    await updateMasteryStats({ ...baseParams, isCorrect: true })
    const payload = state.masteryUpsertPayload ?? {}
    expect(payload.consecutive_correct_streak).toBe(4)
  })

  test('increments distinct_questions_seen only for a new question_id', async () => {
    state.masteryRow = { ...blankRow, current_mastery_weight: 0.5, total_attempts: 3, total_correct: 3, avg_time_ms: 1000, consecutive_correct_streak: 3, highest_difficulty_correct: 0.5, distinct_questions_seen: 3 }
    // First call: prevSeenCount = 0 → isNewQuestion = true → distinct = 4
    state.interactionsCount = 0
    await updateMasteryStats({ ...baseParams, questionId: 'brand-new-q' })
    expect((state.masteryUpsertPayload ?? {}).distinct_questions_seen).toBe(4)

    // Second call: prevSeenCount = 5 → isNewQuestion = false → distinct stays at 3
    state.interactionsCount = 5
    await updateMasteryStats({ ...baseParams, questionId: 'seen-q' })
    expect((state.masteryUpsertPayload ?? {}).distinct_questions_seen).toBe(3)
  })

  test('computes incremental avg_time_ms', async () => {
    state.masteryRow = { ...blankRow, current_mastery_weight: 0.5, total_attempts: 4, total_correct: 4, avg_time_ms: 4000, consecutive_correct_streak: 4, highest_difficulty_correct: 0.5, distinct_questions_seen: 4 }
    await updateMasteryStats({ ...baseParams, timeSpentMs: 8000 })
    const payload = state.masteryUpsertPayload ?? {}
    // totalAttempts = 5, newAvg = 4000 + (8000 - 4000) / 5 = 4800
    expect(payload.avg_time_ms).toBe(4800)
  })

  test('records last_encountered as an ISO timestamp', async () => {
    await updateMasteryStats(baseParams)
    const payload = state.masteryUpsertPayload ?? {}
    expect(typeof payload.last_encountered).toBe('string')
    const ts = new Date(payload.last_encountered as string)
    expect(Number.isNaN(ts.getTime())).toBe(false)
  })

  test('uses taxonomy_tree difficulty for highest_difficulty_correct when correct', async () => {
    state.masteryRow = { ...blankRow, current_mastery_weight: 0.5, highest_difficulty_correct: 0.3 }
    state.taxonomyRow = { difficulty: 0.8, bloom_level: 'apply' }
    await updateMasteryStats({ ...baseParams, isCorrect: true })
    const payload = state.masteryUpsertPayload ?? {}
    // max(0.3, 0.8) = 0.8
    expect(payload.highest_difficulty_correct).toBeCloseTo(0.8, 5)
    expect(payload.has_bloom_apply_correct).toBe(true)
  })

  test('does not advance highest_difficulty_correct on incorrect answer', async () => {
    state.masteryRow = { ...blankRow, current_mastery_weight: 0.5, highest_difficulty_correct: 0.3 }
    state.taxonomyRow = { difficulty: 0.9, bloom_level: 'apply' }
    await updateMasteryStats({ ...baseParams, isCorrect: false })
    const payload = state.masteryUpsertPayload ?? {}
    // incorrect → keep prev (0.3), don't apply max with taxonomy
    expect(payload.highest_difficulty_correct).toBeCloseTo(0.3, 5)
  })
})
