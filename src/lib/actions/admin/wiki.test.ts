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

mock.module('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'wiki_articles') {
        return {
          insert: insertArticleMock,
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
}))

const canManageContentMock = mock(() => Promise.resolve(true))
mock.module('@/lib/admin/roles', () => ({
  canManageContent: canManageContentMock,
}))

mock.module('next/cache', () => ({
  revalidateTag: mock(),
  revalidatePath: mock(),
}))

const logServerErrorMock = mock(() => Promise.resolve())
mock.module('@/lib/logging/server', () => ({
  logServerError: logServerErrorMock,
}))

const { createWikiArticle } = await import('./wiki')

describe('admin/wiki', () => {
  beforeEach(() => {
    insertArticleMock.mockClear()
    insertTaxonomyMock.mockClear()
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
})
