import React from 'react'
import { describe, expect, mock, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

mock.module('@/lib/actions/wiki-actions', () => ({
  getWikiArticleBySlug: async () => null,
}))

mock.module('@/lib/analytics', () => ({
  trackEvent: () => undefined,
}))

import { compileWikiArticleWithRenderer } from './WikiArticle'

describe('compileWikiArticleWithRenderer heading anchors', () => {
  test('renders duplicate headings with unique IDs that match table-of-contents extraction', async () => {
    const { content } = await compileWikiArticleWithRenderer({
      article: {
        article_id: 'article-heading-test',
        content: '## Same Heading\nFirst.\n### Same Heading\nSecond.\n## Same Heading\nThird.',
      },
    })

    const markup = renderToStaticMarkup(<>{content}</>)

    expect(markup).toContain('id="same-heading"')
    expect(markup).toContain('id="same-heading-2"')
    expect(markup).toContain('id="same-heading-3"')
  })
})
