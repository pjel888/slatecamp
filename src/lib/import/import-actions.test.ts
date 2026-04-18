import { beforeEach, describe, expect, mock, test } from 'bun:test'

const insertMock = mock(() => Promise.resolve({ error: null }))
const resolvePrimaryArticleEqMock = mock(() =>
  Promise.resolve({
    data: { article_id: 'article-1' },
    error: null,
  }),
)
const articleMaybeSingleMock = mock(() =>
  Promise.resolve({
    data: { article_id: 'article-1', status: 'approved' },
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
        }
      }

      if (table === 'wiki_article_taxonomy') {
        return {
          select: mock(() => ({
            eq: mock(() => ({
              limit: mock(() => ({
                maybeSingle: resolvePrimaryArticleEqMock,
              })),
              eq: mock(() => ({
                limit: mock(() => ({
                  maybeSingle: mappingMaybeSingleMock,
                })),
              })),
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

      return {} as never
    },
  }),
}))

const canManageContentMock = mock(() => Promise.resolve(true))
mock.module('@/lib/admin/roles', () => ({
  canManageContent: canManageContentMock,
}))

const revalidatePathMock = mock(() => {})
mock.module('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}))

const { importQuestionsToDb } = await import('./import-actions')

describe('importQuestionsToDb', () => {
  beforeEach(() => {
    canManageContentMock.mockResolvedValue(true)
    insertMock.mockClear()
    resolvePrimaryArticleEqMock.mockClear()
    articleMaybeSingleMock.mockClear()
    mappingMaybeSingleMock.mockClear()
    revalidatePathMock.mockClear()
  })

  test('rejects import when manage permission is denied', async () => {
    canManageContentMock.mockResolvedValueOnce(false)

    await expect(
      importQuestionsToDb([
        {
          taxonomy_node_id: '550e8400-e29b-41d4-a716-446655440000',
          question_text: 'What is a column primarily designed to resist?',
          options: ['Compression', 'Tension', 'Torsion', 'Buckling'],
          correct_answer: 'a',
          difficulty: 0.5,
        },
      ] as any),
    ).resolves.toEqual({
      success: false,
      error: 'Unauthorized: insufficient permissions',
    })
  })

  test('rejects JSON import rows with unsupported fifth option', async () => {
    await expect(
      importQuestionsToDb([
        {
          taxonomy_node_id: '550e8400-e29b-41d4-a716-446655440000',
          question_text: 'What is a column primarily designed to resist?',
          options: ['Compression', 'Tension', 'Torsion', 'Buckling', 'Shear'],
          correct_answer: 'a',
          difficulty: 0.5,
        },
      ] as any),
    ).rejects.toThrow('exactly 4 options')
  })
})
