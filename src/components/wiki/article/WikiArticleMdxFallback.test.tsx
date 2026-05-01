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

describe('compileWikiArticleWithRenderer fallback', () => {
  test('renders article prose when malformed JSX attributes would otherwise fail MDX compilation', async () => {
    const { content } = await compileWikiArticleWithRenderer({
      article: {
        article_id: 'malformed-mdx-fallback',
        content: [
          '## Core Concept',
          'This lesson should remain available to learners.',
          '<WikiMistakeCard mistake="Dismissing Indigenous architecture" correction="Students say Indigenous architecture is "temporary\\" or \\"primitive.\\"" context="Say "site-responsive\\"" />',
          'The next paragraph should still render after the malformed widget.',
        ].join('\n\n'),
      },
    })

    const markup = renderToStaticMarkup(<>{content}</>)

    expect(markup).toContain('Core Concept')
    expect(markup).toContain('This lesson should remain available to learners.')
    expect(markup).toContain('The next paragraph should still render')
    expect(markup).not.toContain('WikiArticleError')
  })

  test('renders article prose when array props are authored without JSX expression braces', async () => {
    const { content } = await compileWikiArticleWithRenderer({
      article: {
        article_id: 'malformed-array-props-fallback',
        content: [
          '## Danger Areas',
          'Learn the difference before applying the rule.',
          '<WikiExamTable headers=["Danger Area", "Entitlement"] rows=[["Esteros", "NO — occupants not entitled to relocation"]] />',
          'Use the legal category before choosing the intervention.',
        ].join('\n\n'),
      },
    })

    const markup = renderToStaticMarkup(<>{content}</>)

    expect(markup).toContain('Danger Areas')
    expect(markup).toContain('Learn the difference before applying the rule.')
    expect(markup).toContain('Use the legal category')
    expect(markup.toLowerCase()).not.toContain('summary')
  })
})
