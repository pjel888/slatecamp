import { beforeEach, describe, expect, mock, test } from 'bun:test'

const wikiArticlesUpdateEqMock = mock(() => Promise.resolve({ error: null }))
const wikiArticlesDeleteEqMock = mock(() => Promise.resolve({ error: null }))
const wikiArticlesInsertSingleMock = mock(() =>
  Promise.resolve({
    data: { article_id: 'article-new', slug: 'new-article' },
    error: null,
  }),
)
const wikiArticlesMaybeSingleMock = mock(() =>
  Promise.resolve({
    data: null,
    error: null,
  }),
)
const questionsSelectEqMock = mock(() =>
  Promise.resolve({
    data: new Array(10).fill({
      question_id: 'q-1',
      topic_id: 'node-1',
      question_type: 'mcq',
      article_id: 'article-existing',
    }),
    error: null,
  }),
)

const wikiArticleTaxonomyDeleteEqMock = mock(() => Promise.resolve({ error: null }))
const wikiArticleTaxonomyInsertMock = mock(() => Promise.resolve({ error: null }))
const wikiArticleTaxonomySelectEqMock = mock(() =>
  Promise.resolve({
    data: [],
    error: null,
  }),
)

const mockSupabase = {
  from: (table: string) => {
    if (table === 'wiki_articles') {
      return {
        update: mock(() => ({ eq: wikiArticlesUpdateEqMock })),
        delete: mock(() => ({ eq: wikiArticlesDeleteEqMock })),
        insert: mock(() => ({
          select: () => ({
            single: wikiArticlesInsertSingleMock,
          }),
        })),
        select: mock(() => ({
          eq: mock(() => {
            const query = {
              maybeSingle: wikiArticlesMaybeSingleMock,
              limit: mock(() => ({
                maybeSingle: wikiArticlesMaybeSingleMock,
              })),
            }

            return query
          }),
        })),
      }
    }

    if (table === 'wiki_article_taxonomy') {
      return {
        delete: mock(() => ({ eq: wikiArticleTaxonomyDeleteEqMock })),
        insert: wikiArticleTaxonomyInsertMock,
        select: mock(() => ({
          eq: wikiArticleTaxonomySelectEqMock,
        })),
      }
    }

    if (table === 'questions') {
      return {
        select: mock(() => ({
          eq: questionsSelectEqMock,
        })),
      }
    }

    return {} as never
  },
}

mock.module('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockSupabase,
}))

const mockCanManageContent = mock(() => Promise.resolve(true))
const mockCanReviewContent = mock(() => Promise.resolve(true))
mock.module('@/lib/admin/roles', () => ({
  canManageContent: mockCanManageContent,
  canReviewContent: mockCanReviewContent,
  assertPermission: mock(() => Promise.resolve()),
}))

const mockRevalidateTag = mock(() => {})
const mockRevalidatePath = mock(() => {})
const nextCacheMock = () => ({
  revalidateTag: mockRevalidateTag,
  revalidatePath: mockRevalidatePath,
})
mock.module('@/lib/cache/revalidate', nextCacheMock)

const logServerErrorMock = mock(() => Promise.resolve())
mock.module('@/lib/logging/server', () => ({
  logServerError: logServerErrorMock,
}))

mock.module('@/components/wiki/article/WikiArticle', () => ({
  compileWikiArticleWithRenderer: mock(({ article }: { article: { content: string } }) => {
    if (article.content.includes('<Note broken')) {
      return Promise.reject(new Error('Invalid MDX'))
    }

    return Promise.resolve({
      source: '<h2>Heading</h2><p>Body</p>',
      error: null,
    })
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
      from: mockSupabase.from,
    }),
  createStaticClient: () =>
    Promise.resolve({
      from: mockSupabase.from,
    }),
  getUser: () =>
    Promise.resolve({
      data: {
        user: { id: 'user-1' },
      },
    }),
}))

const {
  updateArticleFull,
  saveArticleFull,
  compileMdxPreview,
} = await import('./content')

describe('admin/content', () => {
  beforeEach(() => {
    wikiArticlesUpdateEqMock.mockClear()
    wikiArticlesDeleteEqMock.mockClear()
    wikiArticlesInsertSingleMock.mockClear()
    wikiArticlesMaybeSingleMock.mockClear()
    questionsSelectEqMock.mockClear()
    wikiArticleTaxonomyDeleteEqMock.mockClear()
    wikiArticleTaxonomyInsertMock.mockClear()
    wikiArticleTaxonomySelectEqMock.mockClear()
    mockCanManageContent.mockResolvedValue(true)
    mockRevalidateTag.mockClear()
    mockRevalidatePath.mockClear()
    logServerErrorMock.mockClear()
  })

  describe('updateArticleFull', () => {
    test('updates taxonomy mapping when node_id is provided', async () => {
      wikiArticlesMaybeSingleMock.mockResolvedValueOnce({
        data: { status: 'approved' },
        error: null,
      })
      const result = await updateArticleFull('art-1', {
        title: 'New Title',
        content: 'New Content',
        node_id: 'node-1',
      })

      expect(result.error).toBeNull()
      expect(wikiArticlesUpdateEqMock).toHaveBeenCalledTimes(1)
      expect(wikiArticleTaxonomyDeleteEqMock).toHaveBeenCalledTimes(1)
      expect(wikiArticleTaxonomyInsertMock).toHaveBeenCalledWith({
        article_id: 'art-1',
        node_id: 'node-1',
        is_primary: true,
      })
    })
  })

  describe('saveArticleFull', () => {
    test('creates a new article row and taxonomy mapping when article_id is missing', async () => {
      const result = await saveArticleFull({
        article_id: '',
        title: 'New Article',
        content: '# Hello world',
        node_id: 'node-1',
      })

      expect(result.error).toBeNull()
      expect(result.article).toEqual({
        article_id: 'article-new',
        slug: 'new-article',
        created: true,
      })
      expect(wikiArticlesInsertSingleMock).toHaveBeenCalledTimes(1)
      expect(wikiArticleTaxonomyInsertMock).toHaveBeenCalledWith({
        article_id: 'article-new',
        node_id: 'node-1',
        is_primary: true,
      })
    })

    test('updates an existing article through the update path when article_id exists', async () => {
      wikiArticlesMaybeSingleMock.mockResolvedValueOnce({
        data: { status: 'approved' },
        error: null,
      })
      const result = await saveArticleFull({
        article_id: 'article-existing',
        title: 'Existing Article',
        content: 'Updated content',
        node_id: 'node-2',
      })

      expect(result.error).toBeNull()
      expect(result.article).toEqual({
        article_id: 'article-existing',
        slug: '',
        created: false,
      })
      expect(wikiArticlesUpdateEqMock).toHaveBeenCalledTimes(1)
      expect(wikiArticleTaxonomyInsertMock).toHaveBeenCalledWith({
        article_id: 'article-existing',
        node_id: 'node-2',
        is_primary: true,
      })
    })

    test('fails fast when title is missing on create', async () => {
      const result = await saveArticleFull({
        article_id: '',
        title: '   ',
        content: 'content',
      })

      expect(result.error).toBeInstanceOf(Error)
      expect((result.error as Error).message).toBe('Title is required')
      expect(wikiArticlesInsertSingleMock).not.toHaveBeenCalled()
    })

    test('rejects creating an article directly in published status', async () => {
      const result = await saveArticleFull({
        article_id: '',
        title: 'Published Article',
        content: '# Published body',
        status: 'published',
        node_id: 'node-1',
      })

      expect(result.error).toBeInstanceOf(Error)
      expect((result.error as Error).message).toContain('Cannot create an article directly in published status')
      expect(wikiArticlesInsertSingleMock).not.toHaveBeenCalled()
    })
  })

  test('smoke-tests MDX preview compilation for valid article content', async () => {
    const result = await compileMdxPreview('## Heading\n\nA paragraph of content.')

    expect(result.error).toBeNull()
    expect(result.source).toBeTruthy()
  })

  test('blocks article save when MDX compilation fails', async () => {
    const result = await saveArticleFull({
      article_id: '',
      title: 'Broken Article',
      content: '<Note broken',
    })

    expect(result.error).toBeInstanceOf(Error)
    expect((result.error as Error).message).toContain('MDX compile validation failed')
  })
})
