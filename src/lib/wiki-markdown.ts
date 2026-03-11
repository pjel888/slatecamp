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
    const h2 = line.match(/^## (.+)$/)
    const h3 = line.match(/^### (.+)$/)
    if (h2) {
      const text = h2[1].trim()
      headings.push({ id: slugify(text), text, level: 2 })
    } else if (h3) {
      const text = h3[1].trim()
      headings.push({ id: slugify(text), text, level: 3 })
    }
  }

  return headings
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

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})
turndown.keep(['hr'])
turndown.addRule('strikethrough', {
  filter: ['del', 's', 'strike'],
  replacement: (content) => `~~${content}~~`,
})

/** Convert HTML from Tiptap back to markdown. */
export function htmlToMarkdown(html: string): string {
  if (!html?.trim()) return ''
  const md = turndown.turndown(html.trim())
  return md || ''
}
