import { marked } from 'marked'
import TurndownService from 'turndown'

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
