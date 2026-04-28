import { beforeEach, describe, expect, mock, test } from 'bun:test'

const insertArticleMock = mock(() => ({
  select: () => ({
    single: () =>
      Promise.resolve({
        data: { article_id: 'article-1' },
        error: null,
      }),
  }),
}))

const insertTaxonomyMock = mock(() =>
  Promise.resolve({
    error: { message: 'mapping failed' },
  }),
)
const updateEqMock = mock(() => Promise.resolve({ error: null }))
const articleMaybeSingleMock = mock(() =>
  Promise.resolve({
    data: { article_id: 'article-1', content: '## Heading\n\nBody' },
    error: null,
  }),
)
const compileMdxPreviewMock = mock(() =>
  Promise.resolve({ source: {}, error: null }),
)

mock.module('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'wiki_articles') {
        return {
          insert: insertArticleMock,
          select: mock(() => ({
            eq: mock(() => ({
              maybeSingle: articleMaybeSingleMock,
            })),
          })),
          update: mock(() => ({
            eq: updateEqMock,
          })),
        }
      }

      if (table === 'wiki_article_taxonomy') {
        return {
          insert: insertTaxonomyMock,
        }
      }

      return {} as never
    },
  }),
}))

mock.module('@/lib/supabase/server', () => ({
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
    }),
  createStaticClient: () =>
    Promise.resolve({
      from: () => ({ select: () => ({}) }),
    }),
}))

const canManageContentMock = mock(() => Promise.resolve(true))
const canReviewContentMock = mock(() => Promise.resolve(true))
mock.module('@/lib/admin/roles', () => ({
  canManageContent: canManageContentMock,
  canReviewContent: canReviewContentMock,
  assertPermission: mock(() => Promise.resolve()),
}))

const nextCacheMock = () => ({
  revalidateTag: mock(),
  revalidatePath: mock(),
})
mock.module('@/lib/cache/revalidate', nextCacheMock)

const logServerErrorMock = mock(() => Promise.resolve())
mock.module('@/lib/logging/server', () => ({
  logServerError: logServerErrorMock,
}))

mock.module('@/components/wiki/article/WikiArticle', () => ({
  compileWikiArticleWithRenderer: mock(() =>
    Promise.resolve({
      source: '<h2>Heading</h2><p>Body</p>',
      error: null,
    }),
  ),
}))

mock.module('./content', () => ({
  compileMdxPreview: compileMdxPreviewMock,
}))

const {
  createWikiArticle,
  approveWikiArticleReview,
  requestWikiArticleChanges,
} = await import('./wiki')

describe('admin/wiki', () => {
  beforeEach(() => {
    insertArticleMock.mockClear()
    insertTaxonomyMock.mockClear()
    updateEqMock.mockClear()
    articleMaybeSingleMock.mockClear()
    compileMdxPreviewMock.mockClear()
    logServerErrorMock.mockClear()
  })

  test('returns mapping error and logs when taxonomy link creation fails', async () => {
    const result = await createWikiArticle({
      title: 'Article',
      content: 'Content',
      discipline_id: '550e8400-e29b-41d4-a716-446655440000',
    } as any)

    expect((result.error as any)?.message).toBe('mapping failed')
    expect(logServerErrorMock).toHaveBeenCalledTimes(1)
  })

  test('approves review items through the canonical review action', async () => {
    const result = await approveWikiArticleReview('article-1', 'Looks good')

    expect(result.error).toBeNull()
    expect(updateEqMock).toHaveBeenCalledTimes(1)
  })

  test('requires comments when requesting changes', async () => {
    await expect(requestWikiArticleChanges('article-1', '   ')).rejects.toThrow(
      'Reviewer comments are required',
    )
  })
})
