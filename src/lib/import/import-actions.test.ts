import { beforeEach, describe, expect, mock, test } from 'bun:test'

const insertMock = mock(() => Promise.resolve({ error: null }))
const primaryMaybeSingleMock = mock(() =>
  Promise.resolve({
    data: { article_id: 'article-1' },
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
        }
      }

      if (table === 'wiki_article_taxonomy') {
        return {
          select: mock(() => ({
            eq: mock(() => ({
              eq: mock(() => ({
                limit: mock(() => ({
                  maybeSingle: primaryMaybeSingleMock,
                })),
              })),
              limit: mock(() => ({
                maybeSingle: mappingMaybeSingleMock,
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

const { importQuestionsToDb } = await import('./import-actions')

describe('import-actions', () => {
  beforeEach(() => {
    insertMock.mockClear()
    primaryMaybeSingleMock.mockClear()
    articleMaybeSingleMock.mockClear()
    mappingMaybeSingleMock.mockClear()
  })

  test('resolves article ownership before inserting imported questions', async () => {
    const result = await importQuestionsToDb([
      {
        taxonomy_node_id: '550e8400-e29b-41d4-a716-446655440000',
        question_text: 'What is a wall?',
        option_a: 'A',
        option_b: 'B',
        option_c: 'C',
        option_d: 'D',
        correct_answer: 'a',
        difficulty: 3,
      },
    ] as any)

    expect(result.success).toBe(true)
    expect(insertMock).toHaveBeenCalledTimes(1)
  })

  test('blocks import when no readable article can be resolved for the topic', async () => {
    primaryMaybeSingleMock.mockResolvedValueOnce({
      data: null,
      error: null,
    })
    mappingMaybeSingleMock.mockResolvedValueOnce({
      data: null,
      error: null,
    })

    const result = await importQuestionsToDb([
      {
        taxonomy_node_id: '550e8400-e29b-41d4-a716-446655440000',
        question_text: 'What is a wall?',
        option_a: 'A',
        option_b: 'B',
        option_c: 'C',
        option_d: 'D',
        correct_answer: 'a',
        difficulty: 3,
      },
    ] as any)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Standard questions must be linked to an article.')
  })
})
