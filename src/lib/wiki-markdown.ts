import { marked } from 'marked'
import TurndownService from 'turndown'

// --- Table of contents (server-safe) ---

export interface TocHeading {
  id: string
  text: string
  level: 2 | 3
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/**
 * Extracts h2 and h3 headings from markdown source (## / ### lines).
 * Safe to call from server components.
 */
export function extractHeadings(markdown: string): TocHeading[] {
  const lines = markdown.split('\n')
  const headings: TocHeading[] = []

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s*(.+)$/)
    if (match) {
      const hashes = match[1]
      const text = match[2].trim()
      const level = hashes.length === 2 ? 2 : 3
      headings.push({ id: slugify(text), text, level })
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
