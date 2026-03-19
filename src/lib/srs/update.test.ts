import { describe, test, expect, mock, beforeEach } from 'bun:test'

// ---------------------------------------------------------------------------
// Module mocks — must be declared before any import of the module under test.
// ---------------------------------------------------------------------------

const supabaseMockState = {
  selectSingleResult: { data: null, error: null } as { data: unknown; error: Error | null },
  shouldReject: false, // when true, .single() rejects to trigger catch block
}

const buildQueryChain = (): Record<string, unknown> => ({
  eq: mock(function () { return buildQueryChain() }),
  single: mock(() => {
    if (supabaseMockState.shouldReject) {
      return Promise.reject(new Error('Supabase connection failed'))
    }
    return Promise.resolve(supabaseMockState.selectSingleResult)
  }),
})

const buildUpdateChain = (): Record<string, unknown> => ({
  eq: mock(function () { return buildUpdateChain() }),
  // Make the chain awaitable — Supabase query builders are PromiseLike
  then: (resolve: (v: unknown) => void) => resolve({ error: null }),
})

const mockSupabaseClient = {
  from: mock((_table: string) => ({
    select: mock(() => buildQueryChain()),
    update: mock(() => buildUpdateChain()),
  })),
}

mock.module('@/lib/supabase/server', () => ({
  createClient: mock(() => Promise.resolve(mockSupabaseClient)),
}))

mock.module('./sm2', () => ({
  calculateNextReview: mock(() => ({ interval: 3, easeFactor: 2.5, repetitions: 1 })),
  getNextReviewDate: mock(() => new Date('2026-06-01T00:00:00.000Z')),
}))

// ---------------------------------------------------------------------------
// Import the module under test AFTER mocks are registered.
// ---------------------------------------------------------------------------
import { updateSrsSchedule, deriveQualityRating } from './update'

// ---------------------------------------------------------------------------
// describe: updateSrsSchedule — failure recovery
// ---------------------------------------------------------------------------
describe('updateSrsSchedule — failure recovery', () => {
  beforeEach(() => {
    supabaseMockState.selectSingleResult = { data: null, error: null }
    supabaseMockState.shouldReject = false
  })

  test('resolves to undefined when Supabase select returns error object', async () => {
    supabaseMockState.selectSingleResult = {
      data: null,
      error: new Error('DB connection failed'),
    }
    // Should NOT throw — function handles error gracefully
    await expect(updateSrsSchedule('user-1', 'topic-1', 3)).resolves.toBeUndefined()
  })

  test('resolves to undefined on a successful run', async () => {
    supabaseMockState.selectSingleResult = {
      data: { review_interval_days: 6, ease_factor: 2.5 },
      error: null,
    }
    await expect(updateSrsSchedule('user-1', 'topic-1', 4)).resolves.toBeUndefined()
  })

  test('logs error to console.error when Supabase query rejects', async () => {
    // Make .single() reject — triggers the catch block
    supabaseMockState.shouldReject = true

    const originalConsoleError = console.error
    const captured: unknown[][] = []
    console.error = (...args: unknown[]) => { captured.push(args) }

    try {
      await updateSrsSchedule('user-2', 'topic-2', 3)
      expect(captured.length).toBeGreaterThan(0)
      const firstLog = String(captured[0]?.[0] ?? '')
      expect(firstLog).toContain('[SRS]')
    } finally {
      console.error = originalConsoleError
    }
  })

  test('does not rethrow — subsequent code runs after failure', async () => {
    supabaseMockState.shouldReject = true
    let afterCallReached = false
    await updateSrsSchedule('user-3', 'topic-3', 2)
    afterCallReached = true
    expect(afterCallReached).toBe(true)
  })

  test('uses fallback interval of 1 when mastery row does not exist', async () => {
    supabaseMockState.selectSingleResult = { data: null, error: null }
    await expect(updateSrsSchedule('user-4', 'topic-new', 4)).resolves.toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// describe: deriveQualityRating — pure scoring logic
// ---------------------------------------------------------------------------
describe('deriveQualityRating', () => {
  test('returns 1 for any incorrect answer', async () => {
    const result = await deriveQualityRating({
      isCorrect: false, timeSpentMs: 5000, avgTimeMs: 10000,
      confidence: 'sure', isSuspectedLuckyGuess: false,
    })
    expect(result).toBe(1)
  })

  test('returns 1 for incorrect answer even when marked as lucky guess', async () => {
    const result = await deriveQualityRating({
      isCorrect: false, timeSpentMs: 500, avgTimeMs: 10000,
      confidence: null, isSuspectedLuckyGuess: true,
    })
    expect(result).toBe(1)
  })

  test('returns 2 for a correct suspected lucky guess', async () => {
    const result = await deriveQualityRating({
      isCorrect: true, timeSpentMs: 1000, avgTimeMs: 10000,
      confidence: null, isSuspectedLuckyGuess: true,
    })
    expect(result).toBe(2)
  })

  test('returns 5 for confident + fast correct answers (timeRatio < 1.5)', async () => {
    const result = await deriveQualityRating({
      isCorrect: true, timeSpentMs: 5000, avgTimeMs: 10000,
      confidence: 'sure', isSuspectedLuckyGuess: false,
    })
    expect(result).toBe(5)
  })

  test('returns 4 for confident but slow correct answers (timeRatio >= 1.5)', async () => {
    const result = await deriveQualityRating({
      isCorrect: true, timeSpentMs: 20000, avgTimeMs: 10000,
      confidence: 'sure', isSuspectedLuckyGuess: false,
    })
    expect(result).toBe(4)
  })

  test('returns 4 for non-confident fast correct answers (timeRatio < 1.2)', async () => {
    const result = await deriveQualityRating({
      isCorrect: true, timeSpentMs: 9000, avgTimeMs: 10000,
      confidence: null, isSuspectedLuckyGuess: false,
    })
    expect(result).toBe(4)
  })

  test('returns 3 for non-confident moderate-speed answers (timeRatio >= 1.2)', async () => {
    const result = await deriveQualityRating({
      isCorrect: true, timeSpentMs: 15000, avgTimeMs: 10000,
      confidence: null, isSuspectedLuckyGuess: false,
    })
    expect(result).toBe(3)
  })

  test('returns 4 when avgTimeMs is 0 (timeRatio defaults to 1)', async () => {
    const result = await deriveQualityRating({
      isCorrect: true, timeSpentMs: 5000, avgTimeMs: 0,
      confidence: null, isSuspectedLuckyGuess: false,
    })
    expect(result).toBe(4)
  })

  test('returns 5 when avgTimeMs is 0 and confidence is sure', async () => {
    const result = await deriveQualityRating({
      isCorrect: true, timeSpentMs: 5000, avgTimeMs: 0,
      confidence: 'sure', isSuspectedLuckyGuess: false,
    })
    expect(result).toBe(5)
  })

  test('boundary: timeRatio exactly 1.5 with sure confidence returns 4', async () => {
    const result = await deriveQualityRating({
      isCorrect: true, timeSpentMs: 15000, avgTimeMs: 10000,
      confidence: 'sure', isSuspectedLuckyGuess: false,
    })
    expect(result).toBe(4)
  })

  test('boundary: timeRatio exactly 1.2 with no confidence returns 3', async () => {
    const result = await deriveQualityRating({
      isCorrect: true, timeSpentMs: 12000, avgTimeMs: 10000,
      confidence: null, isSuspectedLuckyGuess: false,
    })
    expect(result).toBe(3)
  })
})
