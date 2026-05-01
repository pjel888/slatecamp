import { marked } from 'marked'
import TurndownService from 'turndown'

// --- Table of contents (server-safe) ---

export interface TocHeading {
  id: string
  text: string
  level: 2 | 3
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-') || 'section'
}

export function createHeadingIdTracker() {
  const seen = new Map<string, number>()

  return (text: string) => {
    const baseId = slugifyHeading(text)
    const nextCount = (seen.get(baseId) ?? 0) + 1
    seen.set(baseId, nextCount)
    return nextCount === 1 ? baseId : `${baseId}-${nextCount}`
  }
}

/**
 * Extracts h2 and h3 headings from markdown source (## / ### lines).
 * Safe to call from server components.
 */
export function extractHeadings(markdown: string): TocHeading[] {
  const lines = markdown.split('\n')
  const headings: TocHeading[] = []
  const nextHeadingId = createHeadingIdTracker()

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s*(.+)$/)
    if (match) {
      const hashes = match[1]
      const text = match[2].trim()
      const level = hashes.length === 2 ? 2 : 3
      headings.push({ id: nextHeadingId(text), text, level })
    }
  }

  return headings
}

/**
 * Estimate reading time in minutes (~200 words/min for technical content).
 */
export function estimateReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

/**
 * Sanitize MDX content to avoid common parsing errors from raw database content.
 * Fixes "Unexpected character \" in attribute name" errors by removing backslashes 
 * incorrectly used for line continuation or quote escaping inside JSX tags.
 */
export function sanitizeMDX(content: string): string {
  if (!content) return ''
  
  return content
    // Normalize JSX block components that start text on the same line. MDX can
    // treat `<Tip>**bold**` as one paragraph and fail before the closing tag.
    .replace(/<((?:Tip|Note|Warn|Warning|Example|Callout|ExamTip|AlertBox|CalloutBox|WikiCalloutBox)(?:\s[^>]*)?)>(?=[*_#>-])/g, '<$1>\n\n')

    // 1. Fix literal \" used inside JSX tags (MDX doesn't support backslash escaping in attributes)
    // This replaces attr=\"value\" with attr="value"
    .replace(/(<[A-Z][a-zA-Z0-9]*\s+[^>]*?=\s*)\\"/g, '$1"')
    .replace(/(\s*=\s*"[^"]*)\\"/g, '$1"')
    
    // 2. Remove backslashes used for line continuation inside JSX tags
    // e.g. <Component \ /> or <Component attr="val" \ next="val" />
    .replace(/(<[A-Z][a-zA-Z0-9]*\s+[^>]*?)\s*\\\s*(\/?>|[a-zA-Z])/g, '$1 $2')
    
    // 3. Escape raw "<" characters that look like tags but aren't (e.g. "a < b")
    // MDX 2 is sensitive to < followed by a letter/number without a space.
    .replace(/<([0-9=])/g, '&lt;$1')
}

const WRAPPED_LEARNING_COMPONENTS =
  'Tip|Note|Warn|Warning|Example|Callout|ExamTip|AlertBox|CalloutBox|WikiCalloutBox|AuthorityContent|LawCallout|RevealBlock'

/**
 * Last-resort source for DB-authored MDX that contains malformed JSX.
 *
 * Some imported articles contain invalid component attributes such as
 * unescaped quotes inside string props or array props written as `rows=[...]`
 * instead of `rows={...}`. We should not replace the article with an error
 * card; learners should still get the authored prose. This fallback preserves
 * headings and body text, unwraps prose-bearing learning callouts, and removes
 * broken self-closing widgets that cannot be parsed safely without inventing
 * content.
 */
export function createMdxFallbackSource(content: string): string {
  if (!content) return ''

  const componentWrapperPattern = new RegExp(
    `<(?:${WRAPPED_LEARNING_COMPONENTS})(?:\\s[^>]*)?>`,
    'g',
  )
  const componentClosingPattern = new RegExp(
    `</(?:${WRAPPED_LEARNING_COMPONENTS})>`,
    'g',
  )

  const withoutWrapperTags = sanitizeMDX(content)
    .replace(componentWrapperPattern, '\n\n')
    .replace(componentClosingPattern, '\n\n')

  const fallbackLines: string[] = []
  let skippingComponent: string | null = null

  for (const line of withoutWrapperTags.split('\n')) {
    const trimmed = line.trim()

    if (skippingComponent) {
      if (
        trimmed.includes('/>') ||
        trimmed.includes(`</${skippingComponent}>`)
      ) {
        skippingComponent = null
      }
      continue
    }

    const componentMatch = trimmed.match(/^<([A-Z][A-Za-z0-9]*)\b/)
    if (componentMatch) {
      const componentName = componentMatch[1]
      if (!trimmed.includes('/>') && !trimmed.includes(`</${componentName}>`)) {
        skippingComponent = componentName
      }
      continue
    }

    if (/^<\/[A-Z][A-Za-z0-9]*>/.test(trimmed)) continue

    fallbackLines.push(line)
  }

  return fallbackLines
    .join('\n')
    // Escape any remaining JSX-looking tags so prose with comparisons or
    // malformed snippets is rendered as text instead of parsed as MDX JSX.
    .replace(/<(\/?[A-Za-z][^>\n]*)>/g, '&lt;$1&gt;')
    // Fallback mode is prose-first; escape braces from LaTeX/text fragments so
    // MDX does not interpret them as JavaScript expressions.
    .replace(/([{}])/g, '\\$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Inject elaborative interrogation (EI) prompts after specified headings.
 */
export function injectEIPrompts(content: string, prompts: any[]): string {
  if (!prompts || prompts.length === 0) return content
  const promptsByHeading = new Map<string, number[]>()
  prompts.forEach((prompt, idx) => {
    const key = prompt.insert_after_heading?.toLowerCase().trim()
    if (key) {
      if (!promptsByHeading.has(key)) promptsByHeading.set(key, [])
      promptsByHeading.get(key)!.push(idx)
    }
  })

  const lines = content.split('\n')
  const result: string[] = []
  for (const line of lines) {
    result.push(line)
    const headingMatch = line.match(/^(#{2,4})\s+(.+)$/)
    if (headingMatch) {
      const headingText = headingMatch[2].trim().toLowerCase()
      const indices = promptsByHeading.get(headingText)
      if (indices) {
        for (const idx of indices) {
          result.push('')
          result.push(`<EIPrompt idx={${idx}} prompts={__mdx_prompts} responses={__mdx_responses} articleId={__mdx_article_id} />`)
          result.push('')
        }
      }
    }
  }
  return result.join('\n')
}

// --- Markdown ↔ HTML (Tiptap) ---

/** Convert markdown to HTML for Tiptap. */
export async function markdownToHtml(md: string): Promise<string> {
  if (!md?.trim()) return '<p></p>'
  const html = await Promise.resolve(
    marked.parse(md.trim(), { gfm: true }) as string | Promise<string>
  )
  return html && typeof html === 'string' ? html : '<p></p>'
}

// Initialize turndown with a fallback for CJS/ESM compatibility
const TurndownConstructor = (TurndownService as any).default || TurndownService;
const turndown = new TurndownConstructor({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})
turndown.keep(['hr'])
turndown.addRule('strikethrough', {
  filter: ['del', 's', 'strike'],
  replacement: (content: string) => `~~${content}~~`,
})

/** Convert HTML from Tiptap back to markdown. */
export function htmlToMarkdown(html: string): string {
  if (!html?.trim()) return ''
  const md = turndown.turndown(html.trim())
  return md || ''
}
