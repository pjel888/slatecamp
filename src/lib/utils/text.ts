/**
 * Extract a plain-text snippet from a TipTap/ProseMirror JSON document.
 */
export function snippet(content: unknown, maxLen = 80): string {
  try {
    const doc = content as { content?: Array<{ content?: Array<{ text?: string }> }> }
    if (!doc.content) return ''
    let text = ''
    function walk(n: { content?: Array<{ text?: string }> }): void {
      if (n.content) n.content.forEach((c) => ('text' in c && c.text ? (text += c.text) : walk(c as never)))
    }
    doc.content.forEach(walk)
    return text.replace(/\s+/g, ' ').trim().slice(0, maxLen) || ''
  } catch { return '' }
}
