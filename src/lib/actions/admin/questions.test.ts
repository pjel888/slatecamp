import { beforeEach, describe, expect, mock, test } from 'bun:test'

const insertMock = mock(() => Promise.resolve({ error: null }))
const updateEqMock = mock(() => Promise.resolve({ error: null }))
const deleteEqMock = mock(() => Promise.resolve({ error: null }))
const deleteInMock = mock(() => Promise.resolve({ error: null }))
const existingQuestionMaybeSingleMock = mock(() =>
  Promise.resolve({
    data: {
      article_id: 'article-1',
      topic_id: 'topic-1',
      text: 'Existing question text',
      options: [
        { id: 'A', text: 'A' },
        { id: 'B', text: 'B' },
        { id: 'C', text: 'C' },
        { id: 'D', text: 'D' },
      ],
      difficulty: 0.5,
    },
    error: null,
  }),
)
const articleMaybeSingleMock = mock(() =>
  Promise.resolve({
    data: { article_id: 'article-1', status: 'published' },
    error: null,
  }),
)
const mappingMaybeSingleMock = mock(() =>
  Promise.resolve({
    data: { article_id: 'article-1' },
    error: null,
  }),
)

mock.module('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'questions') {
        return {
          insert: insertMock,
          update: mock(() => ({ eq: updateEqMock })),
          delete: mock(() => ({ eq: deleteEqMock, in: deleteInMock })),
          select: mock(() => ({
            eq: mock(() => ({
              maybeSingle: existingQuestionMaybeSingleMock,
            })),
          })),
        }
      }

      if (table === 'wiki_articles') {
        return {
          select: mock(() => ({
            eq: mock(() => ({
              maybeSingle: articleMaybeSingleMock,
            })),
          })),
        }
      }

      if (table === 'wiki_article_taxonomy') {
        return {
          select: mock(() => ({
            eq: mock(() => ({
              eq: mock(() => ({
                limit: mock(() => ({
                  maybeSingle: mappingMaybeSingleMock,
                })),
              })),
            })),
          })),
        }
      }

      return {} as never
    },
  }),
}))

mock.module('@/lib/supabase/server', () => ({
  createStaticClient: () => Promise.resolve({}),
  createServiceClient: () => Promise.resolve({}),
  hasAuthCookie: () => Promise.resolve(false),
  getUserIfPresent: () => Promise.resolve({ data: { user: null } }),
  createClient: () =>
    Promise.resolve({
      auth: {
        getUser: () =>
          Promise.resolve({
            data: {
              user: { id: 'user-1' },
            },
          }),
      },
      from: (table: string) => {
        if (table === 'profiles') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: () => Promise.resolve({ data: { role: 'super_admin' }, error: null }),
              }),
            }),
          }
        }
        if (table === 'user_roles') {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve({ data: [{ role: 'super_admin' }], error: null }),
              }),
            }),
          }
        }
        return {} as never
      },
    }),
  getUser: () =>
    Promise.resolve({
      data: {
        user: { id: 'user-1' },
      },
    }),
}))

const canManageContentMock = mock(() => Promise.resolve(true))
const canReviewContentMock = mock(() => Promise.resolve(true))
const assertPermissionMock = mock(() => Promise.resolve())
mock.module('@/lib/admin/roles', () => ({
  canManageContent: canManageContentMock,
  canReviewContent: canReviewContentMock,
  assertPermission: assertPermissionMock,
}))

mock.module('next/cache', () => ({
  revalidatePath: mock(),
  unstable_cache: (fn: (...args: any[]) => any) => fn,
}))

const logServerErrorMock = mock(() => Promise.resolve())
mock.module('@/lib/logging/server', () => ({
  logServerError: logServerErrorMock,
}))

const { createQuestion, updateQuestion } = await import('./questions')

describe('admin/questions', () => {
  beforeEach(() => {
    canManageContentMock.mockResolvedValue(true)
    assertPermissionMock.mockResolvedValue(undefined)
    insertMock.mockClear()
    updateEqMock.mockClear()
    deleteEqMock.mockClear()
    deleteInMock.mockClear()
    existingQuestionMaybeSingleMock.mockClear()
    articleMaybeSingleMock.mockClear()
    mappingMaybeSingleMock.mockClear()
    logServerErrorMock.mockClear()
    assertPermissionMock.mockClear()
  })

  test('throws validation error when article_id is missing', async () => {
    await expect(
      createQuestion({
        text: 'Question',
        options: [
          { text: 'A' },
          { text: 'B' },
          { text: 'C' },
          { text: 'D' },
        ],
        topic_id: 'topic-1',
      } as any),
    ).rejects.toThrow('article_id is required')
  })

  test('rejects question mutations when manage permission is denied', async () => {
    assertPermissionMock.mockRejectedValueOnce(new Error('Forbidden: admin.content.create required'))

    await expect(
      createQuestion({
        text: 'Question',
        options: [
          { text: 'A' },
          { text: 'B' },
          { text: 'C' },
          { text: 'D' },
        ],
        topic_id: 'topic-1',
        article_id: 'article-1',
      } as any),
    ).rejects.toThrow('Forbidden')
  })

  test('creates a standard question with canonical option shape and article ownership', async () => {
    const result = await createQuestion({
      text: 'Question',
      options: [
        { text: 'A' },
        { text: 'B' },
        { text: 'C' },
        { text: 'D' },
      ],
      topic_id: 'topic-1',
      article_id: 'article-1',
    } as any)

    expect(result.error).toBeNull()
    expect(insertMock).toHaveBeenCalledTimes(1)
  })

  test('allows standard questions linked to in-review articles during authoring', async () => {
    articleMaybeSingleMock.mockResolvedValueOnce({
      data: { article_id: 'article-1', status: 'in_review' },
      error: null,
    })

    await expect(
      createQuestion({
        text: 'Question',
        options: [
          { text: 'A' },
          { text: 'B' },
          { text: 'C' },
          { text: 'D' },
        ],
        topic_id: 'topic-1',
        article_id: 'article-1',
      } as any),
    ).resolves.toEqual({ error: null })
  })

  test('rejects updates when article/topic linkage is invalid', async () => {
    mappingMaybeSingleMock.mockResolvedValueOnce({
      data: null,
      error: null,
    })

    await expect(
      updateQuestion('question-1', {
        topic_id: 'topic-1',
        article_id: 'article-1',
      }),
    ).rejects.toThrow('Question topic must belong to the linked article taxonomy mapping.')
  })

  test('rejects exception question types in the standard question flow', async () => {
    await expect(
      createQuestion({
        text: 'Scenario question',
        options: [
          { text: 'A' },
          { text: 'B' },
          { text: 'C' },
          { text: 'D' },
        ],
        topic_id: 'topic-1',
        article_id: 'article-1',
        question_type: 'design_scenario',
      } as any),
    ).rejects.toThrow('dedicated authoring flow')
  })
})
