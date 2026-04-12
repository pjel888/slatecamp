import { describe, expect, test } from 'bun:test'

import {
  fetchQuestionsForClient,
  toClientQuestion,
  toDifficultyLabel,
} from '@/lib/quiz/to-client-question'

describe('toDifficultyLabel', () => {
  test('maps difficulty bands consistently', () => {
    expect(toDifficultyLabel(0.1)).toBe('Easy')
    expect(toDifficultyLabel(0.4)).toBe('Medium')
    expect(toDifficultyLabel(0.69)).toBe('Medium')
    expect(toDifficultyLabel(0.7)).toBe('Hard')
  })
})

describe('toClientQuestion', () => {
  test('maps metadata and normalizes options for client payloads', () => {
    const question = toClientQuestion(
      {
        question_id: 'q-1',
        topic_id: 'topic-1',
        text: 'What is the answer?',
        options: {
          a: 'Alpha',
          b: 'Beta',
          c: 'Gamma',
        },
        prompt_image_url: 'https://example.com/image.png',
        difficulty: 0.65,
        question_type: 'numeric',
        hint_text: 'Think about the footprint.',
        breadcrumb: 'Area C > Site Planning',
        is_interleaved: true,
      },
      7,
    )

    expect(question).toEqual({
      question_id: 'q-1',
      topic_id: 'topic-1',
      difficulty: 0.65,
      position: 7,
      stem: 'What is the answer?',
      image_url: 'https://example.com/image.png',
      image_alt_text: null,
      taxonomy_breadcrumb: 'Area C > Site Planning',
      difficulty_label: 'Medium',
      is_interleaved: true,
      question_type: 'numeric',
      unit: null,
      hint_text: 'Think about the footprint.',
      options: [
        { id: 'a', letter: 'A', text: 'Alpha' },
        { id: 'b', letter: 'B', text: 'Beta' },
        { id: 'c', letter: 'C', text: 'Gamma' },
      ],
    })
  })
})

describe('fetchQuestionsForClient', () => {
  test('preserves session order and computes positions from the requested offset', async () => {
    const supabase = {
      from: (table: string) => {
        if (table === 'questions') {
          return {
            select: () => ({
              in: async (_column: string, values: string[]) => {
                const rows = [
                  {
                    question_id: 'q-3',
                    article_id: 'article-b',
                    topic_id: 'topic-b',
                    text: 'Third question',
                    options: [{ id: 'b', letter: 'B', text: 'Option B' }],
                    difficulty: 0.9,
                    prompt_image_url: null,
                    question_type: 'mcq',
                    hint_text: 'Check the code clause.',
                  },
                  {
                    question_id: 'q-2',
                    article_id: 'article-a',
                    topic_id: 'topic-a',
                    text: 'Second question',
                    options: [{ id: 'a', letter: 'A', text: 'Option A' }],
                    difficulty: 0.2,
                    prompt_image_url: null,
                    question_type: 'mcq',
                    hint_text: null,
                  },
                ]

                return {
                  data: rows.filter((row) => values.includes(row.question_id)),
                  error: null,
                }
              },
            }),
          }
        }

        if (table === 'taxonomy_tree') {
          return {
            select: () => ({
              in: async (_column: string, values: string[]) => ({
                data: [
                  {
                    node_id: 'topic-a',
                    name: 'Accessibility',
                    subject_area: 'Area B',
                  },
                  {
                    node_id: 'topic-b',
                    name: 'Fire Safety',
                    subject_area: 'Area B',
                  },
                ].filter((row) => values.includes(row.node_id)),
                error: null,
              }),
            }),
          }
        }

        if (table === 'wiki_article_taxonomy') {
          return {
            select: () => ({
              in: (_column: string, articleIds: string[]) => ({
                in: async (_nextColumn: string, topicIds: string[]) => ({
                  data: [
                    { article_id: 'article-a', node_id: 'topic-a' },
                    { article_id: 'article-b', node_id: 'topic-b' },
                  ].filter(
                    (row) =>
                      articleIds.includes(row.article_id) && topicIds.includes(row.node_id),
                  ),
                  error: null,
                }),
              }),
            }),
          }
        }

        if (table === 'wiki_articles') {
          return {
            select: () => ({
              in: async (_column: string, articleIds: string[]) => ({
                data: [
                  { article_id: 'article-a', status: 'published' },
                  { article_id: 'article-b', status: 'published' },
                ].filter((row) => articleIds.includes(row.article_id)),
                error: null,
              }),
            }),
          }
        }

        return {
          select: () => ({
            in: async () => ({
              data: [],
              error: null,
            }),
          }),
        }
      },
    }

    const questions = await fetchQuestionsForClient({
      supabase,
      questionIds: ['q-2', 'q-3'],
      offset: 4,
    })

    expect(questions).toHaveLength(2)
    expect(questions.map((question) => question.question_id)).toEqual(['q-2', 'q-3'])
    expect(questions.map((question) => question.position)).toEqual([5, 6])
    expect(questions.map((question) => question.taxonomy_breadcrumb)).toEqual([
      'Area B > Accessibility',
      'Area B > Fire Safety',
    ])
  })
})
