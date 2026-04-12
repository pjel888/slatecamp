import { describe, expect, test } from 'bun:test'

import {
  countStandardQuestionsForArticle,
  filterQuestionsReadableForStage,
  filterQuestionsWithValidArticleTopicMapping,
  isReadableArticleStatusForStage,
  validateStandardQuestionLinkage,
} from './standard-question'

const createSupabaseStub = (overrides?: {
  articleStatus?: string
  articleStatuses?: Array<{ article_id: string; status: string }>
  mappingRows?: Array<{ article_id: string; node_id: string }>
  hasMapping?: boolean
  questionRows?: Array<{ question_id: string; question_type: string | null }>
}) =>
  ({
    from: (table: string) => {
      if (table === 'wiki_articles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { article_id: 'article-1', status: overrides?.articleStatus ?? 'approved' },
                  error: null,
                }),
            }),
            in: () =>
              Promise.resolve({
                data:
                  overrides?.articleStatuses ?? [
                    {
                      article_id: 'article-1',
                      status: overrides?.articleStatus ?? 'approved',
                    },
                  ],
                error: null,
              }),
          }),
        }
      }

      if (table === 'wiki_article_taxonomy') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                limit: () => ({
                  maybeSingle: () =>
                    Promise.resolve({
                      data: overrides?.hasMapping === false ? null : { article_id: 'article-1' },
                      error: null,
                    }),
                }),
              }),
            }),
            in: (_column: string, firstValues: string[]) => ({
            in: (_nextColumn: string, _secondValues: string[]) =>
                Promise.resolve({
                  data:
                    overrides?.mappingRows ??
                    (overrides?.hasMapping === false
                      ? []
                      : firstValues.map((articleId) => ({
                          article_id: articleId,
                          node_id: 'topic-1',
                        }))),
                  error: null,
                }),
            }),
          }),
        }
      }

      if (table === 'questions') {
        return {
          select: () => ({
            eq: () =>
              Promise.resolve({
                data:
                  overrides?.questionRows ?? [
                    { question_id: 'q-1', question_type: 'mcq' },
                    { question_id: 'q-2', question_type: 'design_scenario' },
                    { question_id: 'q-3', question_type: null },
                  ],
                error: null,
              }),
          }),
        }
      }

      return {}
    },
  }) as any

describe('standard question integrity', () => {
  test('treats editorial states as readable for authoring, but only published for delivery', () => {
    expect(isReadableArticleStatusForStage('draft', 'authoring')).toBe(true)
    expect(isReadableArticleStatusForStage('in_review', 'authoring')).toBe(true)
    expect(isReadableArticleStatusForStage('changes_requested', 'authoring')).toBe(true)
    expect(isReadableArticleStatusForStage('approved', 'authoring')).toBe(true)
    expect(isReadableArticleStatusForStage('published', 'authoring')).toBe(true)
    expect(isReadableArticleStatusForStage('approved', 'delivery')).toBe(false)
    expect(isReadableArticleStatusForStage('published', 'delivery')).toBe(true)
  })

  test('allows standard linkage while the parent article is still in editorial authoring states', async () => {
    const result = await validateStandardQuestionLinkage(createSupabaseStub({
      articleStatus: 'in_review',
    }), {
      articleId: 'article-1',
      topicId: 'topic-1',
      questionType: 'mcq',
      stage: 'authoring',
    })

    expect(result.blockingIssues).toHaveLength(0)
  })

  test('allows exception question types to bypass standard linkage rules', async () => {
    const result = await validateStandardQuestionLinkage(createSupabaseStub(), {
      articleId: null,
      topicId: 'topic-1',
      questionType: 'design_scenario',
      stage: 'authoring',
    })

    expect(result.blockingIssues).toHaveLength(0)
  })

  test('counts only standard questions for article coverage', async () => {
    const result = await countStandardQuestionsForArticle(
      createSupabaseStub({
        questionRows: [
          { question_id: 'q-1', question_type: 'mcq' },
          { question_id: 'q-2', question_type: 'design_scenario' },
          { question_id: 'q-3', question_type: null },
        ].map((question) => ({ ...question, topic_id: 'topic-1', article_id: 'article-1' })),
      }),
      'article-1',
    )

    expect(result.error).toBeNull()
    expect(result.count).toBe(2)
  })

  test('filters out standard questions whose topic is not mapped to their article owner', async () => {
    const result = await filterQuestionsWithValidArticleTopicMapping(
      createSupabaseStub({
        hasMapping: false,
      }),
      [
        {
          question_id: 'q-1',
          article_id: 'article-1',
          topic_id: 'topic-1',
          question_type: 'mcq',
        },
      ],
    )

    expect(result.error).toBeNull()
    expect(result.questions).toHaveLength(0)
  })

  test('filters standard delivery questions to published readable linked articles while keeping exception items', async () => {
    const result = await filterQuestionsReadableForStage(
      createSupabaseStub({
        articleStatuses: [
          { article_id: 'article-1', status: 'published' },
          { article_id: 'article-2', status: 'draft' },
        ],
        mappingRows: [
          { article_id: 'article-1', node_id: 'topic-1' },
          { article_id: 'article-2', node_id: 'topic-2' },
        ],
      }),
      [
        {
          question_id: 'q-1',
          article_id: 'article-1',
          topic_id: 'topic-1',
          question_type: 'mcq',
        },
        {
          question_id: 'q-2',
          article_id: 'article-2',
          topic_id: 'topic-2',
          question_type: 'mcq',
        },
        {
          question_id: 'q-3',
          topic_id: 'topic-x',
          question_type: 'design_scenario',
        },
      ],
      'delivery',
    )

    expect(result.error).toBeNull()
    expect(result.questions.map((question) => question.question_id)).toEqual(['q-1', 'q-3'])
  })
})
