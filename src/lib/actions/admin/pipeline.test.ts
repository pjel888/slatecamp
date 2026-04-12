import { beforeEach, describe, expect, mock, test } from 'bun:test'

const articleMaybeSingleMock = mock(() =>
  Promise.resolve({
    data: { article_id: 'article-1', content: '## Heading\n\nBody', status: 'approved' },
    error: null,
  }),
)
const standardQuestionSelectEqMock = mock(() =>
  Promise.resolve({
    data: new Array(10).fill({ question_id: 'q-1', topic_id: 'topic-1', article_id: 'article-1', question_type: 'mcq' }),
    error: null,
  }),
)
const mappingInMock = mock(() =>
  Promise.resolve({
    data: [{ article_id: 'article-1', node_id: 'topic-1' }],
    error: null,
  }),
)
let simulateLegacyReviewSchema = false
const updateEqMock = mock(() => Promise.resolve({ error: null }))
const legacyUpdateEqMock = mock(() => Promise.resolve({ error: null }))

mock.module('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'wiki_articles') {
        return {
          select: mock(() => ({
            eq: mock(() => ({
              maybeSingle: articleMaybeSingleMock,
            })),
          })),
          update: mock((payload: { status?: string }) => ({
            eq: mock(() => {
              if (simulateLegacyReviewSchema && payload.status === 'in_review') {
                return Promise.resolve({ error: { code: '23514', message: 'status constraint' } })
              }
              if (payload.status === 'pending_review') {
                return legacyUpdateEqMock()
              }
              return updateEqMock()
            }),
          })),
        }
      }

      if (table === 'questions') {
        return {
          select: mock(() => ({
            eq: standardQuestionSelectEqMock,
          })),
        }
      }

      if (table === 'wiki_article_taxonomy') {
        return {
          select: mock(() => ({
            in: mock(() => ({
              in: mappingInMock,
            })),
          })),
        }
      }

      return {} as never
    },
  }),
}))

const canManageContentMock = mock(() => Promise.resolve(true))
mock.module('@/lib/admin/roles', () => ({
  canManageContent: canManageContentMock,
  canReviewContent: mock(() => Promise.resolve(true)),
}))

mock.module('@/lib/supabase/server', () => ({
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
    }),
  getUser: () =>
    Promise.resolve({
      data: {
        user: { id: 'user-1' },
      },
    }),
}))

mock.module('next/cache', () => ({
  revalidatePath: mock(),
  revalidateTag: mock(),
  unstable_cache: (fn: (...args: any[]) => any) => fn,
}))

const logServerErrorMock = mock(() => Promise.resolve())
mock.module('@/lib/logging/server', () => ({
  logServerError: logServerErrorMock,
}))

const compileMdxPreviewMock = mock(() =>
  Promise.resolve({ source: {}, error: null }),
)
mock.module('./content', () => ({
  compileMdxPreview: compileMdxPreviewMock,
}))

const { updateArticleStatus } = await import('./pipeline')

describe('admin/pipeline', () => {
  beforeEach(() => {
    simulateLegacyReviewSchema = false
    articleMaybeSingleMock.mockClear()
    standardQuestionSelectEqMock.mockClear()
    mappingInMock.mockClear()
    updateEqMock.mockClear()
    legacyUpdateEqMock.mockClear()
    logServerErrorMock.mockClear()
    compileMdxPreviewMock.mockClear()
  })

  test('blocks publish when directly linked question coverage is below threshold', async () => {
    standardQuestionSelectEqMock.mockResolvedValueOnce({
      data: new Array(9).fill({ question_id: 'q-1', topic_id: 'topic-1', article_id: 'article-1', question_type: 'mcq' }),
      error: null,
    })

    await expect(updateArticleStatus('article-1', 'published')).rejects.toThrow(
      'fewer than 10 directly linked standard questions',
    )
  })

  test('publishes after compile validation and sufficient direct question coverage', async () => {
    await expect(updateArticleStatus('article-1', 'published')).resolves.toBeUndefined()
    expect(updateEqMock).toHaveBeenCalledTimes(1)
  })

  test('blocks publish until the article has been approved', async () => {
    articleMaybeSingleMock.mockResolvedValueOnce({
      data: { article_id: 'article-1', content: '## Heading\n\nBody', status: 'draft' },
      error: null,
    })

    await expect(updateArticleStatus('article-1', 'published')).rejects.toThrow(
      'approved in review',
    )
  })

  test('ignores stale cross-topic standard questions when counting publish coverage', async () => {
    mappingInMock.mockResolvedValueOnce({
      data: [],
      error: null,
    })

    await expect(updateArticleStatus('article-1', 'published')).rejects.toThrow(
      'fewer than 10 directly linked standard questions',
    )
  })

  test('falls back to pending_review when canonical in_review is rejected by legacy schema', async () => {
    simulateLegacyReviewSchema = true
    await expect(updateArticleStatus('article-legacy', 'in_review')).resolves.toBeUndefined()
    expect(legacyUpdateEqMock).toHaveBeenCalledTimes(1)
  })
})
