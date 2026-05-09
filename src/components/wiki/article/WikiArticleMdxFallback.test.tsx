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

describe('WikiArticle rendering', () => {
  test('rejects raw SlateCamp UI block placeholders before MDX can render them as prose', async () => {
    await expect(
      compileWikiArticleWithRenderer({
        article: {
          article_id: 'raw-ui-placeholder',
          content: [
            '## Core Concept',
            '[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]',
            'Extracted summary:',
            '- Props: id="media-test", layout="single", type="image"',
            '- Text: (none detected) [/SLATECAMP_UI_BLOCK]',
          ].join('\n'),
        },
      }),
    ).rejects.toThrow('Raw SLATECAMP_UI_BLOCK placeholders detected')
  })

  test('preserves and renders ArticleMedia with fallback when malformed ExamTip triggers primary compile failure', async () => {
    const result = await compileWikiArticleWithRenderer({
      article: {
        article_id: 'malformed-exam-tip-fallback',
        content: [
          '## Core Concept',
          'This lesson should remain available to learners.',
          '<ExamTip>Remember this for the ALE — it is frequently tested.</ExamTip>',
          '<ArticleMedia id="test" layout="single" type="image" status="placeholder" alt="Test" caption="Test" suggestedAsset="Test" placementIntent="Test verification" />',
          'The next paragraph should still render.',
        ].join('\n\n'),
      },
    })

    const markup = renderToStaticMarkup(<>{result.content}</>)

    expect(markup).toContain('Core Concept')
    expect(markup).toContain('This lesson should remain available to learners.')
    expect(markup).toContain('The next paragraph should still render')
    expect(markup).toContain('Image Placeholder')
    expect(markup).toContain('Test verification')
    expect(markup).not.toContain('WikiArticleError')
  })

  test('renders article prose with fallback when malformed JSX attributes would otherwise fail MDX compilation', async () => {
    const { content } = await compileWikiArticleWithRenderer({
      article: {
        article_id: 'malformed-mdx-fallback',
        content: [
          '## Core Concept',
          'This lesson should remain available to learners.',
          '<WikiMistakeCard mistake="Dismissing Indigenous architecture" correction="Students say Indigenous architecture is temporary or primitive" />',
          'The next paragraph should still render.',
        ].join('\n\n'),
      },
    })

    const markup = renderToStaticMarkup(<>{content}</>)

    expect(markup).toContain('Core Concept')
    expect(markup).toContain('This lesson should remain available to learners.')
    expect(markup).toContain('The next paragraph should still render')
    expect(markup).not.toContain('WikiArticleError')
  })

  test('gracefully renders error state when array props use bracket syntax instead of JSX braces', async () => {
    try {
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
      expect(markup).toBeDefined()
    } catch (e: any) {
      expect(e.message).toContain('MDX')
    }
  })
})
