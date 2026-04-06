import { beforeEach, describe, expect, mock, test } from 'bun:test'

mock.module('next/server', () => ({
  after: (fn: () => any) => fn(), // Execute immediately in tests
}))

const createServiceClientMock = mock(() => {
  const mockQuery: any = {
    select: () => mockQuery,
    eq: () => mockQuery,
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
    upsert: () => mockQuery,
    update: () => mockQuery,
    in: () => mockQuery,
  }
  return Promise.resolve({ 
    rpc: () => mockQuery,
    from: () => mockQuery,
  })
})
const getUserMock = mock(() =>
  Promise.resolve({
    data: {
      user: { id: 'user-1' },
    },
  }),
)
const getOwnedSessionOrThrowMock = mock()
const classifyErrorDiagnosticMock = mock()
const classifyAndStoreErrorMock = mock()
const runPostInteractionHooksMock = mock()
const endSessionActionMock = mock()

mock.module('@/lib/supabase/server', () => ({
  createServiceClient: createServiceClientMock,
  getUser: getUserMock,
}))

mock.module('./session-helpers', () => ({
  getOwnedSessionOrThrow: getOwnedSessionOrThrowMock,
}))

mock.module('./classify-and-store-error', () => ({
  classifyErrorDiagnostic: classifyErrorDiagnosticMock,
  classifyAndStoreError: classifyAndStoreErrorMock,
}))

mock.module('@/lib/actions/mastery/post-interaction-hooks', () => ({
  runPostInteractionHooks: runPostInteractionHooksMock,
}))

mock.module('./end-session', () => ({
  endSession: endSessionActionMock,
}))

// Mock other internal deps that might be called
mock.module('@/lib/srs/update', () => ({
  deriveQualityRating: mock(() => Promise.resolve(3)),
  updateSrsSchedule: mock(() => Promise.resolve()),
}))
mock.module('@/lib/actions/cache-tags', () => ({
  revalidateDashboardCacheTags: mock(() => {}),
}))

const { submitAnswer } = await import('./submit-answer')

describe('submitAnswer', () => {
  const baseInput = {
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    questionId: '550e8400-e29b-41d4-a716-446655440001',
    selectedOptionId: 'a',
    timeSpentMs: 5000,
  }

  const baseSession = {
    session_id: '550e8400-e29b-41d4-a716-446655440000',
    user_id: 'user-1',
    status: 'in_progress',
    config: { mode: 'camp', feedback: { timing: 'immediate' } },
    question_ids: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
    answered_count: 0,
    correct_count: 0,
  }

  const baseQuestion = {
    question_id: '550e8400-e29b-41d4-a716-446655440001',
    topic_id: '550e8400-e29b-41d4-a716-446655440003',
    correct_option_id: 'a',
    rationale: 'Because science.',
    difficulty: 0.5,
    options: { a: 'Yes', b: 'No' },
    question_type: 'mcq',
  }

  beforeEach(() => {
    mock.restore()
    createServiceClientMock.mockClear()
    getUserMock.mockClear()
    getOwnedSessionOrThrowMock.mockReset()
    classifyErrorDiagnosticMock.mockReset()
    classifyAndStoreErrorMock.mockReset()
    runPostInteractionHooksMock.mockReset()
    endSessionActionMock.mockReset()
  })

  test('returns immediate feedback and triggers background hooks on success', async () => {
    getOwnedSessionOrThrowMock.mockResolvedValue(baseSession)
    
    const rpcMock = mock(() => ({
      single: () => Promise.resolve({
        data: {
          interaction_id: 'int-1',
          answered_count: 1,
          correct_count: 1,
          wiki_slug: 'test-article',
          rationale: 'Because science.',
        },
        error: null
      })
    }))

    createServiceClientMock.mockReturnValue({
      rpc: rpcMock,
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: table === 'questions' ? baseQuestion : null,
              error: null
            })
          })
        })
      })
    })

    const result = await submitAnswer(baseInput)

    expect(result.isCorrect).toBe(true)
    expect(result.answeredCount).toBe(1)
    expect(result.sessionComplete).toBe(false)
    expect(result.wikiArticleUrl).toContain('test-article')
    expect(rpcMock).toHaveBeenCalled()
  })

  test('final question triggers session completion', async () => {
    const lastQuestionSession = { ...baseSession, question_ids: ['550e8400-e29b-41d4-a716-446655440001'] }
    getOwnedSessionOrThrowMock.mockResolvedValue(lastQuestionSession)
    
    const rpcMock = mock(() => ({
      single: () => Promise.resolve({
        data: {
          interaction_id: 'int-1',
          answered_count: 1,
          correct_count: 1,
          wiki_slug: 'test-article',
          rationale: 'Final rationale.',
        },
        error: null
      })
    }))

    const finalResult = { score: { correct: 1, total: 1, percent: 100 } }
    endSessionActionMock.mockResolvedValue(finalResult)

    createServiceClientMock.mockReturnValue({
      rpc: rpcMock,
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: table === 'questions' ? baseQuestion : null,
              error: null
            })
          })
        })
      })
    })

    const result = await submitAnswer(baseInput)

    expect(result.sessionComplete).toBe(true)
    expect(result.finalResult).toEqual(finalResult as any)
    expect(endSessionActionMock).toHaveBeenCalledWith({
      sessionId: baseInput.sessionId,
      endReason: 'completed'
    })
  })

  test('falls back gracefully when RPC fails', async () => {
    getOwnedSessionOrThrowMock.mockResolvedValue(baseSession)
    
    const rpcMock = mock(() => ({
      single: () => Promise.resolve({
        data: null,
        error: { message: 'Method not found', code: 'P0001' }
      })
    }))

    const upsertMock = mock(() => ({
      select: () => ({
        single: () => Promise.resolve({ data: { interaction_id: 'int-fallback' }, error: null })
      })
    }))

    const updateMock = mock(() => ({
      eq: () => ({ eq: () => Promise.resolve({ error: null }) })
    }))

    const mockQuery: any = {
      select: () => mockQuery,
      eq: () => mockQuery,
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      upsert: upsertMock,
      update: updateMock,
    }

    createServiceClientMock.mockReturnValue({
      rpc: (name: string) => {
        if (name === 'submit_quiz_answer_v2') return { single: () => Promise.resolve({ data: null, error: { message: 'Method not found', code: 'P0001' } }) }
        if (name === 'get_quiz_session_interaction_stats') return Promise.resolve({
          data: [{ answered_count: 1, correct_count: 1 }]
        })
        return mockQuery
      },
      from: (table: string) => {
        if (table === 'questions') return {
          select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: baseQuestion, error: null }) }) })
        }
        return mockQuery
      }
    })

    const result = await submitAnswer(baseInput)

    expect(result.isCorrect).toBe(true)
    expect(result.answeredCount).toBe(1)
    expect(upsertMock).toHaveBeenCalled()
    expect(updateMock).toHaveBeenCalled()
  })
})
