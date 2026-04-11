import { beforeEach, describe, expect, mock, test } from 'bun:test'

const getUserMock = mock(() =>
  Promise.resolve({
    data: {
      user: { id: 'user-1' },
    },
  }),
)

const createServiceClientMock = mock(() =>
  Promise.resolve({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null }),
          limit: () => Promise.resolve({ data: [] }),
        }),
      }),
    }),
  }),
)

const selectQuestionsWithRoutingMock = mock(() => {
  throw new Error('routing failed')
})

const logServerErrorMock = mock(() => Promise.resolve())

mock.module('@/lib/supabase/server', () => ({
  getUser: getUserMock,
  createServiceClient: createServiceClientMock,
}))

mock.module('@/lib/quiz/intelligent-routing', () => ({
  selectQuestionsWithRouting: selectQuestionsWithRoutingMock,
}))

mock.module('@/lib/quiz/interleaved-selection', () => ({
  selectQuestionsWithInterleaving: mock(() => Promise.resolve([])),
}))

mock.module('@/lib/quiz/mode-presets', () => ({
  mergeWithPreset: () => ({
    setup: {
      questionCount: 10,
      topics: ['topic-1'],
      disciplines: [],
      initialDifficulty: null,
    },
  }),
}))

mock.module('@/lib/actions/cached-queries', () => ({
  resolveTaxonomyDescendants: () => Promise.resolve(['topic-1']),
}))

mock.module('@/lib/quiz/to-client-question', () => ({
  buildTaxonomyBreadcrumbMap: () => Promise.resolve(new Map()),
  toClientQuestion: mock(),
}))

mock.module('@/lib/entitlements/get-viewer-entitlements', () => ({
  getViewerEntitlements: () =>
    Promise.resolve({
      decisions: {
        questionsUnlimited: { allowed: true },
      },
    }),
}))

mock.module('@/lib/entitlements/audit', () => ({
  logEntitlementAuditEvent: mock(),
  serializeOverrideState: mock(),
}))

mock.module('@/lib/logging/server', () => ({
  logServerError: logServerErrorMock,
}))

const { startSession } = await import('./start-session')

describe('quiz-v2/start-session', () => {
  beforeEach(() => {
    logServerErrorMock.mockClear()
    selectQuestionsWithRoutingMock.mockClear()
  })

  test('returns the existing typed failure contract and logs once on fatal failure', async () => {
    const result = await startSession({
      mode: 'camp',
      config: {},
    } as any)

    expect(result.success).toBe(false)
    expect((result as any).error).toBe('UNKNOWN')
    expect(logServerErrorMock).toHaveBeenCalledTimes(1)
  })
})
