import { beforeEach, describe, expect, mock, test } from 'bun:test'

const createClientMock = mock(() => Promise.resolve({ id: 'supabase-client' }))
const getUserMock = mock(() =>
  Promise.resolve({
    data: {
      user: { id: 'user-1' },
    },
  }),
)
const getOwnedSessionOrThrowMock = mock()
const fetchQuestionsForClientMock = mock()

mock.module('@/lib/supabase/server', () => ({
  createStaticClient: () => Promise.resolve({}),
  createServiceClient: createClientMock,
  hasAuthCookie: () => Promise.resolve(false),
  getUserIfPresent: () => Promise.resolve({ data: { user: null } }),
  createClient: createClientMock,
  getUser: getUserMock,
}))

mock.module('@/lib/actions/quiz-v2/session-helpers', () => ({
  getOwnedSessionOrThrow: getOwnedSessionOrThrowMock,
}))

mock.module('@/lib/quiz/to-client-question', () => ({
  fetchQuestionsForClient: fetchQuestionsForClientMock,
}))

const { getSessionQuestions } = await import('@/lib/actions/quiz-v2/get-session-questions')

describe('getSessionQuestions', () => {
  beforeEach(() => {
    createClientMock.mockClear()
    getUserMock.mockClear()
    getOwnedSessionOrThrowMock.mockReset()
    fetchQuestionsForClientMock.mockReset()
  })

  test('uses the server-owned session question order and slices it by offset and limit', async () => {
    getOwnedSessionOrThrowMock.mockResolvedValue({
      question_ids: ['q-1', 'q-2', 'q-3', 'q-4'],
    })
    fetchQuestionsForClientMock.mockResolvedValue([
      {
        question_id: 'q-2',
        topic_id: 'topic-2',
        difficulty: 0.4,
        position: 2,
        stem: 'Question 2',
        image_url: null,
        image_alt_text: null,
        taxonomy_breadcrumb: 'Area A > Topic 2',
        difficulty_label: 'Medium',
        question_type: 'mcq',
        options: [],
      },
      {
        question_id: 'q-3',
        topic_id: 'topic-3',
        difficulty: 0.7,
        position: 3,
        stem: 'Question 3',
        image_url: null,
        image_alt_text: null,
        taxonomy_breadcrumb: 'Area A > Topic 3',
        difficulty_label: 'Hard',
        question_type: 'mcq',
        options: [],
      },
    ])

    const result = await getSessionQuestions({
      sessionId: '00000000-0000-0000-0000-000000000000',
      offset: 1,
      limit: 2,
    })

    expect(result).toHaveLength(2)
    expect(result.map((question) => question.question_id)).toEqual(['q-2', 'q-3'])
    expect(result.map((question) => question.position)).toEqual([2, 3])
    expect(getOwnedSessionOrThrowMock).toHaveBeenCalledWith(
      { id: 'supabase-client' },
      'user-1',
      '00000000-0000-0000-0000-000000000000',
      'question_ids',
    )
    expect(fetchQuestionsForClientMock).toHaveBeenCalledWith({
      supabase: { id: 'supabase-client' },
      questionIds: ['q-2', 'q-3'],
      offset: 1,
    })
  })

  test('rejects invalid slice sizes before any data fetch happens', async () => {
    await expect(
      getSessionQuestions({
        sessionId: '00000000-0000-0000-0000-000000000000',
        offset: 0,
        limit: 500,
      }),
    ).rejects.toBeDefined()

    expect(getOwnedSessionOrThrowMock).not.toHaveBeenCalled()
    expect(fetchQuestionsForClientMock).not.toHaveBeenCalled()
  })
})
