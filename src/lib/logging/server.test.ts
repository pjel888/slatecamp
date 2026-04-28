import { afterAll, beforeEach, describe, expect, mock, test } from 'bun:test'

mock.module('server-only', () => ({}))

const insertMock = mock(() => Promise.resolve({ error: null }))
const selectMock = mock(() => ({
  like: () => ({
    order: () => ({
      limit: () => Promise.resolve({
        data: [
          {
            id: 'evt-1',
            user_id: 'user-1',
            event_name: 'app_error.quiz.submit_answer_failed',
            event_properties: {
              eventName: 'submit_answer_failed',
              severity: 'error',
              family: 'quiz',
              message: 'Failed to submit quiz answer.',
              routeOrAction: 'quiz-v2:submit-answer',
              requestId: 'req-1',
              traceId: 'trace-1',
              metadata: { questionId: 'q-1' },
              error: { message: 'boom' },
              fingerprint: 'fp-1',
              createdAt: '2026-04-12T00:00:00.000Z',
            },
            session_id: 'session-1',
            created_at: '2026-04-12T00:00:00.000Z',
          },
        ],
        error: null,
      }),
    }),
  }),
}))

mock.module('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'analytics_events') {
        return {
          insert: insertMock,
          select: selectMock,
        }
      }

      return {} as never
    },
  }),
}))

const originalResolveRole = { ...(await import('@/lib/entitlements/resolve-role')) }
const originalDevOverrides = { ...(await import('@/lib/entitlements/dev-overrides')) }
const originalPolicy = { ...(await import('@/lib/entitlements/policy')) }

mock.module('@/lib/entitlements/resolve-role', () => ({
  ...originalResolveRole,
  resolveCurrentUserRole: () =>
    Promise.resolve({
      normalizedRole: 'developer',
    }),
  resolveRoleFromInputs: () => ({
    normalizedRole: 'member',
    resolvedFrom: 'none',
    precedenceTrace: [],
  }),
}))

mock.module('@/lib/entitlements/dev-overrides', () => ({
  ...originalDevOverrides,
  resolveDevOverrides: () =>
    Promise.resolve({
      allowDevPortalBypass: false,
    }),
}))

mock.module('@/lib/entitlements/policy', () => ({
  ...originalPolicy,
  canAccessAdminCmsForRole: () => false,
  canAccessCeoPortalForRole: () => false,
  canAccessDeveloperPortalForRole: () => true,
}))

const { getApplicationErrorEvents, logServerError } = await import('./server')

describe('logging/server', () => {
  beforeEach(() => {
    insertMock.mockClear()
  })

  afterAll(() => {
    mock.module('@/lib/entitlements/policy', () => ({ ...originalPolicy }))
    mock.module('@/lib/entitlements/resolve-role', () => ({ ...originalResolveRole }))
    mock.module('@/lib/entitlements/dev-overrides', () => ({ ...originalDevOverrides }))
  })

  test('persists sanitized application errors to analytics_events', async () => {
    await logServerError({
      family: 'admin',
      eventName: 'questions_create_failed',
      message: 'Failed to create question.',
      context: {
        routeOrAction: 'admin:questions.create',
        userId: 'user-1',
        metadata: {
          authorization: 'Bearer secret',
          topicId: 'topic-1',
        },
      },
      error: new Error('boom'),
    })

    expect(insertMock).toHaveBeenCalledTimes(1)
    const payload = (insertMock as any).mock.calls[0][0] as any
    expect(payload.event_name).toBe('app_error.admin.questions_create_failed')
    expect(payload.event_properties.metadata.authorization).toBe('[REDACTED]')
    expect(payload.event_properties.error.message).toBe('boom')
  })

  test('reads application errors through the dedicated server-side read model', async () => {
    const rows = await getApplicationErrorEvents({ limit: 10 })

    expect(rows).toHaveLength(1)
    expect(rows[0]?.family).toBe('quiz')
    expect(rows[0]?.routeOrAction).toBe('quiz-v2:submit-answer')
  })
})
