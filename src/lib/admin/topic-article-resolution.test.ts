import { describe, expect, test } from 'bun:test'

import { resolveTopicArticleContext } from './topic-article-resolution'

describe('resolveTopicArticleContext', () => {
  test('selects the freshest article for a topic and marks ambiguity', () => {
    const result = resolveTopicArticleContext({
      topicId: 'topic-1',
      primaryMappings: [
        { node_id: 'topic-1', article_id: 'article-old' },
        { node_id: 'topic-1', article_id: 'article-new' },
      ],
      articles: [
        { article_id: 'article-old', title: 'Old', status: 'draft', updated_at: '2026-04-12T07:00:00Z' },
        { article_id: 'article-new', title: 'New', status: 'published', updated_at: '2026-04-12T08:00:00Z' },
      ],
    })

    expect(result.selectedTopicArticle?.articleId).toBe('article-new')
    expect(result.hasAmbiguousPrimaryMappings).toBe(true)
  })

  test('returns a single unambiguous article mapping when only one primary exists', () => {
    const result = resolveTopicArticleContext({
      topicId: 'topic-1',
      primaryMappings: [{ node_id: 'topic-1', article_id: 'article-1' }],
      articles: [
        { article_id: 'article-1', title: 'Only', status: 'draft', updated_at: '2026-04-12T07:00:00Z' },
      ],
    })

    expect(result.selectedTopicArticle?.articleId).toBe('article-1')
    expect(result.hasAmbiguousPrimaryMappings).toBe(false)
  })
})
