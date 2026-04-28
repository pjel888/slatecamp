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
const mergeWithPresetMock = mock(() => ({
  setup: {
    questionCount: 10,
    topics: ['topic-1'],
    disciplines: [],
    initialDifficulty: null,
  },
}))
const toClientQuestionMock = mock((_question: any, position: number) => ({
  question_id: `client-q-${position}`,
  topic_id: 'topic-1',
  difficulty: 0.5,
  position,
  stem: `Question ${position}`,
  image_url: null,
  image_alt_text: null,
  taxonomy_breadcrumb: 'Demo > Topic',
  difficulty_label: 'Medium',
  question_type: 'mcq',
  options: [],
}))

const logServerErrorMock = mock(() => Promise.resolve())

mock.module('@/lib/supabase/server', () => ({
  createStaticClient: () => Promise.resolve({}),
  hasAuthCookie: () => Promise.resolve(false),
  getUserIfPresent: () => Promise.resolve({ data: { user: null } }),
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
  mergeWithPreset: mergeWithPresetMock,
}))

mock.module('@/lib/actions/cached-queries', () => ({
  resolveTaxonomyDescendants: () => Promise.resolve(['topic-1']),
}))

mock.module('@/lib/quiz/to-client-question', () => ({
  buildTaxonomyBreadcrumbMap: () => Promise.resolve(new Map()),
  fetchQuestionsForClient: mock(() => Promise.resolve([])),
  toClientQuestion: toClientQuestionMock,
}))

mock.module('@/lib/entitlements/get-viewer-entitlements', () => ({
  getViewerEntitlements: () =>
    Promise.resolve({
      traceId: 'trace-1',
      userId: 'user-1',
      normalizedRole: 'member',
      roleResolution: { resolvedFrom: 'profile' },
      rawTier: 'institutional',
      subscriptionStatus: 'active',
      effectiveTier: 'institutional',
      overrides: {},
      decisions: {
        questions_unlimited: { allowed: true },
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

mock.module('@/lib/admin/editor-integrity/standard-question', () => ({
  filterQuestionsReadableForStage: mock((_supabase: unknown, questions: unknown[]) =>
    Promise.resolve({ questions, error: null }),
  ),
}))

const { startSession } = await import('./start-session')

describe('quiz-v2/start-session', () => {
  beforeEach(() => {
    logServerErrorMock.mockClear()
    selectQuestionsWithRoutingMock.mockClear()
    mergeWithPresetMock.mockClear()
    toClientQuestionMock.mockClear()
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

  test('treats topic ids that fully match question ids as a direct question launch', async () => {
    const directQuestionIds = [
      '00000000-0000-4000-8000-000000000201',
      '00000000-0000-4000-8000-000000000202',
    ]

    mergeWithPresetMock.mockReturnValue({
      setup: {
        questionCount: 2,
        topics: directQuestionIds,
        disciplines: [],
        initialDifficulty: 'medium',
      },
    })

    createServiceClientMock.mockReturnValue(
      Promise.resolve({
        from: (table: string) => {
          if (table === 'user_global_stats') {
            return {
              select: () => ({
                eq: () => ({
                  single: () =>
                    Promise.resolve({
                      data: {
                        global_readiness_score: 72,
                        current_discipline_id: '00000000-0000-4000-8000-000000000101',
                      },
                    }),
                }),
              }),
            }
          }

          if (table === 'user_interactions') {
            return {
              select: () => ({
                eq: () => ({
                  gte: () => ({
                    limit: () => Promise.resolve({ data: [] }),
                  }),
                }),
              }),
            }
          }

          if (table === 'questions') {
            return {
              select: () => ({
                in: () =>
                  Promise.resolve({
                    data: directQuestionIds.map((questionId, index) => ({
                      question_id: questionId,
                      article_id: '00000000-0000-4000-8000-000000000106',
                      topic_id: '00000000-0000-4000-8000-000000000104',
                      text: `Direct question ${index + 1}`,
                      options: [],
                      difficulty: 0.5,
                      prompt_image_url: null,
                      question_type: 'mcq',
                      rationale: null,
                      explanation: null,
                    })),
                    error: null,
                  }),
              }),
            }
          }

          if (table === 'quiz_sessions') {
            return {
              insert: () => ({
                select: () => ({
                  single: () =>
                    Promise.resolve({
                      data: {
                        session_id: '00000000-0000-4000-8000-000000000301',
                      },
                      error: null,
                    }),
                }),
              }),
            }
          }

          if (table === 'taxonomy_tree') {
            return {
              select: () => ({
                in: () => Promise.resolve({ data: [], error: null }),
              }),
            }
          }

          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: null }),
                limit: () => Promise.resolve({ data: [] }),
              }),
            }),
          }
        },
      } as any),
    )

    const result = await startSession({
      mode: 'focus_review',
      config: {
        setup: {
          questionCount: 2,
          topics: directQuestionIds,
          disciplines: [],
          difficultyMode: 'adaptive',
          initialDifficulty: 'medium',
          isTrailSession: false,
          trailDayId: null,
        },
      },
    } as any)

    expect(result.success).toBe(true)
    expect(selectQuestionsWithRoutingMock).not.toHaveBeenCalled()
    expect(toClientQuestionMock).toHaveBeenCalledTimes(2)
  })
})
