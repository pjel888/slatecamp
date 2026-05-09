import { marked } from 'marked'
import TurndownService from 'turndown'
import {
  REGISTERED_WIKI_COMPONENTS,
  BLOCK_WIKI_COMPONENTS_ALTERNATION,
} from './wiki-component-registry'

// --- SlateCamp UI block placeholder detection ---

export function containsSlatecampUiBlockPlaceholder(source?: string | null): boolean {
  if (!source) return false
  return /\[SLATECAMP_UI_BLOCK:[^\]]+\]/.test(source)
}

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
 * Normalize malformed block-level custom component syntax before MDX compilation.
 *
 * MDX requires block-level JSX components to have blank-line separation between
 * the opening tag and its content. This function detects patterns like:
 *
 *   <ExamTip>content here</ExamTip>
 *
 * And normalizes them to:
 *
 *   <ExamTip>
 *
 *   content here
 *
 *   </ExamTip>
 *
 * It only affects known registered wiki block components.
 * Self-closing components, inline HTML, fenced code blocks, and unknown tags
 * are preserved as-is.
 */
export function normalizeWikiMdxComponentBlocks(content: string): string {
  if (!content) return ''

  // Split content into alternate segments: [non-fence, fence, non-fence, fence, ...]
  // Process only non-fence segments with the regex.
  const segments: { text: string; insideFence: boolean }[] = []
  let insideFence = false
  let currentSegmentLines: string[] = []

  const flush = () => {
    if (currentSegmentLines.length > 0) {
      segments.push({
        text: currentSegmentLines.join('\n'),
        insideFence: insideFence,
      })
      currentSegmentLines = []
    }
  }

  for (const line of content.split('\n')) {
    if (line.trimStart().startsWith('```')) {
      if (!insideFence) {
        // Entering a code fence — flush preceding non-fence content,
        // then the fence opener belongs to the fence segment.
        flush()
        currentSegmentLines.push(line)
        insideFence = true
      } else {
        // Exiting a code fence — fence closer still belongs to the
        // fence segment, then flush it and toggle.
        currentSegmentLines.push(line)
        flush()
        insideFence = false
      }
      continue
    }
    currentSegmentLines.push(line)
  }
  flush()

  // Process segments: only normalize outside code fences
  const processed = segments.map((seg) => {
    if (seg.insideFence) return seg.text
    return seg.text.replace(
      new RegExp(
        `<(${BLOCK_WIKI_COMPONENTS_ALTERNATION})(\\s[^>]*)?>(?![\\s]*\\n\\s*\\n)([\\s\\S]*?)</\\1>`,
        'g'
      ),
      (match: string, componentName: string, props: string | undefined, innerContent: string) => {
        const trimmed = innerContent.trim()
        const propStr = props || ''
        return `<${componentName}${propStr}>\n\n${trimmed}\n\n</${componentName}>`
      }
    )
  })

  return processed.join('').trimEnd()
}

/**
 * Sanitize MDX content to avoid common parsing errors from raw database content.
 * Fixes "Unexpected character \" in attribute name" errors by removing backslashes
 * incorrectly used for line continuation or quote escaping inside JSX tags.
 * Also normalizes malformed block-level custom components so MDX can parse them.
 */
export function sanitizeMDX(content: string): string {
  if (!content) return ''

  // Step 0: Normalize malformed block-level custom components
  const withNormalizedBlocks = normalizeWikiMdxComponentBlocks(content)

  let result = withNormalizedBlocks
    // Normalize JSX block components that start text on the same line. MDX can
    // treat `<Tip>**bold**` as one paragraph and fail before the closing tag.
    .replace(/<((?:Tip|Note|Warn|Warning|Example|Callout|ExamTip|AlertBox|CalloutBox|WikiCalloutBox)(?:\s[^>]*)?)>(?=[*_#>-])/g, '<$1>\n\n')

    // 1. Fix literal \" used inside JSX tags (MDX doesn't support backslash escaping in attributes)
    // This replaces attr=\"value\" with attr="value"
    .replace(/(<[A-Z][a-zA-Z0-9]*\s+[^>]*?=\s*)\\\"/g, '$1"')
    .replace(/(\s*=\s*"[^"]*)\\\"/g, '$1"')

    // Clean up backslash-escaped quotes inside ANY JSX tag (multi-line aware).
    // This is the same approach used in createMdxFallbackSource — it works.
    .replace(/<[A-Z][a-zA-Z0-9]*[\s\S]*?\/?>/g, (tag: string) => {
      if (tag.includes('\\"')) {
        return tag.replace(/\\"/g, "'")
      }
      return tag
    })

    // 2. Remove backslashes used for actual line continuation inside JSX tags.
    // Preserve escaped sequences like \n inside quoted props; components such as
    // WikiTableTabs use JSON string props that intentionally contain them.
    .replace(/(<[A-Z][a-zA-Z0-9]*\s+[^>]*?)\s*\\[ \t]*\n\s*(\/?>|[a-zA-Z])/g, '$1 $2')

    // 3. Escape raw "<" characters that look like tags but aren't (e.g. "a < b")
    .replace(/<([0-9=])/g, '&lt;$1')

  return result
}

/**
 * Create a safe fallback MDX source when the primary MDX compilation fails.
 *
 * Unlike the original implementation which aggressively stripped ALL custom
 * component tags, this version preserves known registered components where
 * syntactically valid. It only strips or neutralizes malformed, unknown, or
 * truly unrecoverable component syntax.
 */
export function createMdxFallbackSource(content: string): string {
  if (!content) return ''

  // First, normalize malformed blocks to give MDX the best chance
  const normalized = normalizeWikiMdxComponentBlocks(content)

  // Clean up backslash-escaped quotes inside JSX tags
  const cleaned = normalized.replace(/<[A-Z][a-zA-Z0-9]*[\s\S]*?\/?>/g, (tag: string) => {
    if (tag.includes('\\"')) {
      return tag.replace(/\\"/g, "'")
    }
    return tag
  })

  // Identify known component names for fallback processing
  const knownComponentNames = Array.from(REGISTERED_WIKI_COMPONENTS)
  const knownComponentsAlternation = knownComponentNames.join('|')

  const fallbackLines: string[] = []
  let insideCodeFence = false
  let skippingComponent: string | null = null
  let insidePlaceholder = false

  for (const line of cleaned.split('\n')) {
    const trimmed = line.trim()

    // Preserve raw SlateCamp UI block placeholders as visible sentinels
    if (trimmed.startsWith('[SLATECAMP_UI_BLOCK:')) {
      insidePlaceholder = true
      fallbackLines.push(line)
      continue
    }
    if (trimmed === '[/SLATECAMP_UI_BLOCK]') {
      insidePlaceholder = false
      fallbackLines.push(line)
      continue
    }
    if (insidePlaceholder) {
      fallbackLines.push(line)
      continue
    }

    // Track fenced code blocks to avoid mangling them
    if (trimmed.startsWith('```')) {
      insideCodeFence = !insideCodeFence
      fallbackLines.push(line)
      continue
    }

    // Inside a code fence, preserve everything
    if (insideCodeFence) {
      fallbackLines.push(line)
      continue
    }

    // If we're inside a known component we're skipping, check for end
    if (skippingComponent) {
      if (
        trimmed.includes('/>') ||
        trimmed.includes(`</${skippingComponent}>`)
      ) {
        skippingComponent = null
      }
      continue
    }

    // Detect a custom component opening tag
    const componentMatch = trimmed.match(/^<([A-Z][A-Za-z0-9]*)\b/)
    if (componentMatch) {
      const componentName = componentMatch[1]

      // Known registered component — PRESERVE it (don't strip, don't skip)
      if (REGISTERED_WIKI_COMPONENTS.has(componentName)) {
        fallbackLines.push(line)
        continue
      }

      // Unknown/unregistered component — skip it
      if (!trimmed.includes('/>') && !trimmed.includes(`</${componentName}>`)) {
        // Opening tag without immediate close means it spans multiple lines
        skippingComponent = componentName
      }
      continue
    }

    // Closing tag for unregistered component on its own line
    if (trimmed.startsWith('</')) {
      const closeMatch = trimmed.match(/^<\/([A-Z][A-Za-z0-9]*)>/)
      if (closeMatch) {
        const closeName = closeMatch[1]
        if (REGISTERED_WIKI_COMPONENTS.has(closeName)) {
          // Known component closing tag — preserve it
          fallbackLines.push(line)
        }
        // Unknown closing tags are dropped
        continue
      }
    }

    fallbackLines.push(line)
  }

  let result = fallbackLines.join('\n')

  // In fallback mode, be defensive: escape any remaining unknown JSX-looking tags
  // BUT preserve known registered components (including self-closing ones)
  // Strategy: escape unknown tags only; leave known components as-is
  const knownPattern = new RegExp(
    `(<(?:${knownComponentsAlternation})(?:\\s[^>]*)?\\/?>)`,
    'g'
  )

  // Split into segments: known components vs everything else
  // We need to escape unknown JSX tags while preserving known ones
  const segments = result.split(knownPattern)
  result = segments.map((segment, i) => {
    // Odd indices are known component matches (preserved as-is)
    if (i % 2 === 1) return segment
    // Even indices are the rest — escape any HTML-like tags here
    return segment.replace(/<(?!\/?([A-Za-z][A-Za-z0-9]*)\s*\/?>)[^>]*>/g, (match) => {
      // Only escape if it looks like an HTML/JSX tag (starts with < followed by letter)
      return match
    })
    // More targeted: only escape tags that look like unregistered components
    .replace(/<(\/?)([A-Z][a-zA-Z0-9]*)(\s[^>]*)?\/?>/g, (match, slash, name, props) => {
      // If it's a known registered component, preserve it
      if (REGISTERED_WIKI_COMPONENTS.has(name)) return match
      // Otherwise escape it
      return `&lt;${slash}${name}${props || ''}&gt;`
    })
  }).join('')

  // Escape any remaining unknown component patterns that weren't caught above
  // (handles edge cases like partial tags, malformed syntax)
  result = result
    // Protect known components from regex escaping below
    .replace(/&lt;(\/?)([A-Z][a-zA-Z0-9]*)&gt;/g, '\x00KNOWN_ESCAPED_$1$2\x01')

  // Escape braces from LaTeX/text fragments so MDX does not interpret them
  // as JavaScript expressions — but only in text content, not in JSX props
  // which are already inside known components
  result = result.replace(/([{}])/g, '\\$1')

  // Restore known escaped components
  result = result.replace(/\x00KNOWN_ESCAPED_([^>]*?)\x01/g, '<$1>')

  // Collapse excessive blank lines
  result = result.replace(/\n{3,}/g, '\n\n')

  return result.trim()
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
