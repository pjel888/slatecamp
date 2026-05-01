import { describe, it, expect } from 'bun:test'
import {
  createMdxFallbackSource,
  sanitizeMDX,
  injectEIPrompts,
  extractHeadings,
  slugifyHeading,
} from '../wiki-markdown'

describe('wiki-markdown utility', () => {
  describe('sanitizeMDX', () => {
    it('removes backslash escaping for quotes in JSX attributes', () => {
      const input = '<Component attr=\\"value\\" />'
      const expected = '<Component attr="value" />'
      expect(sanitizeMDX(input)).toBe(expected)
    })

    it('removes backslashes used for line continuation in JSX tags', () => {
      const input = '<Component \n  attr="val" \\ \n  next="val" \n/>'
      const sanitized = sanitizeMDX(input)
      expect(sanitized).not.toContain('\\')
      expect(sanitized).toContain('attr="val"')
      expect(sanitized).toContain('next="val"')
    })

    it('escapes raw "<" followed by numbers or equals', () => {
      expect(sanitizeMDX('a <5')).toBe('a &lt;5')
      expect(sanitizeMDX('a <=b')).toBe('a &lt;=b')
    })

    it('does not escape valid components', () => {
      expect(sanitizeMDX('<Note>text</Note>')).toBe('<Note>text</Note>')
    })

    it('separates inline prose in JSX learning callouts so MDX can parse the block', () => {
      expect(sanitizeMDX('<Tip>**Remember:** inspect the section.</Tip>')).toBe(
        '<Tip>\n\n**Remember:** inspect the section.</Tip>',
      )
    })
  })

  describe('createMdxFallbackSource', () => {
    it('preserves authored prose while removing malformed self-closing learning widgets', () => {
      const malformed = [
        '## Core Concept',
        'Keep the main lesson visible.',
        '<WikiMistakeCard mistake="Dismissing" correction="Students say architecture is "temporary\\" or \\"primitive.\\"" />',
        'Continue with the next idea.',
      ].join('\n')

      const fallback = createMdxFallbackSource(malformed)

      expect(fallback).toContain('## Core Concept')
      expect(fallback).toContain('Keep the main lesson visible.')
      expect(fallback).toContain('Continue with the next idea.')
      expect(fallback).not.toContain('WikiMistakeCard')
    })

    it('unwraps prose-bearing callouts instead of turning the article into a summary', () => {
      const fallback = createMdxFallbackSource(
        '<Tip>**Check this:** explain why the code threshold matters.</Tip>',
      )

      expect(fallback).toContain('**Check this:** explain why the code threshold matters.')
      expect(fallback.toLowerCase()).not.toContain('summary')
    })
  })

  describe('injectEIPrompts', () => {
    const prompts = [
      { prompt_id: 'p1', insert_after_heading: 'Heading 1', prompt_text: 'Q1', reveal_text: 'A1', options: [] }
    ]

    it('injects EIPrompt component after a matching heading', () => {
      const content = '## Heading 1\nSome content.'
      const result = injectEIPrompts(content, prompts)
      expect(result).toContain('<EIPrompt idx={0}')
      expect(result).toContain('## Heading 1')
      expect(result).toContain('Some content.')
    })

    it('is case-insensitive when matching headings', () => {
      const content = '## heading 1\nSome content.'
      const result = injectEIPrompts(content, prompts)
      expect(result).toContain('<EIPrompt idx={0}')
    })

    it('returns original content if no prompts match', () => {
      const content = '## Heading 2\nSome content.'
      const result = injectEIPrompts(content, prompts)
      expect(result).toBe(content)
    })

    it('handles multiple prompts for the same heading', () => {
      const multiPrompts = [
        ...prompts,
        { prompt_id: 'p2', insert_after_heading: 'Heading 1', prompt_text: 'Q2', reveal_text: 'A2', options: [] }
      ]
      const content = '## Heading 1\nSome content.'
      const result = injectEIPrompts(content, multiPrompts)
      expect(result.match(/<EIPrompt/g)?.length).toBe(2)
    })
  })

  describe('extractHeadings', () => {
    it('extracts h2 and h3 headings with slugified IDs', () => {
      const content = '## My Heading\nSome text.\n### Sub Heading'
      const headings = extractHeadings(content)
      expect(headings).toHaveLength(2)
      expect(headings[0]).toEqual({ id: 'my-heading', text: 'My Heading', level: 2 })
      expect(headings[1]).toEqual({ id: 'sub-heading', text: 'Sub Heading', level: 3 })
    })

    it('keeps repeated heading anchors unique in source order', () => {
      const content = '## Same Heading\n### Same Heading\n## Same Heading'
      const headings = extractHeadings(content)

      expect(headings.map((heading) => heading.id)).toEqual([
        'same-heading',
        'same-heading-2',
        'same-heading-3',
      ])
    })

    it('falls back to a stable section anchor for punctuation-only headings', () => {
      expect(slugifyHeading('§')).toBe('section')
      expect(extractHeadings('## §\n## §').map((heading) => heading.id)).toEqual([
        'section',
        'section-2',
      ])
    })
  })
})
