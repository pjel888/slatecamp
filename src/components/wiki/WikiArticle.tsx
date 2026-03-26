import React, { Suspense } from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { extractHeadings } from '@/lib/wiki-markdown'
import type { WikiArticle as WikiArticleType } from '@/types/app'
import type { TocHeading } from '@/lib/wiki-markdown'
import type { EIPrompt, EIResponseMap } from '@/lib/actions/ei-prompts'
import { Button } from '@/components/ui/button'
import { WikiHighlighter } from './WikiHighlighter'
import { WikiNoteAnchor } from './WikiNoteAnchor'
import { WikiTextSelection } from './WikiTextSelection'
import { Note, Warn, Tip, Example, Callout } from './WikiCallout'
import { WikiCalloutBox } from './WikiCalloutBox'
import { WikiExamTable } from './WikiExamTable'
import { WikiArticleHero } from './WikiArticleHero'
import { WikiPartHeader } from './WikiPartHeader'
import { WikiChangedPill } from './WikiChangedPill'
import { WikiMistakeCard } from './WikiMistakeCard'
import { WikiMistakeList } from './WikiMistakeList'
import { ElaborativeInterrogation } from './ElaborativeInterrogation'
import { KeyValues } from './KeyValues'
import { FormulaBlock } from './FormulaBlock'
import { InlineQuiz } from './InlineQuiz'
import { Tabs, Tab } from './WikiTabs'
import { Accordion, AccordionItem } from './WikiAccordion'
import { ExamTip } from './ExamTip'
import { ComparisonTable } from './ComparisonTable'
import { SubjectSnapshot } from './SubjectSnapshot'
import { LawCallout } from './LawCallout'
import { RevealBlock } from './RevealBlock'
import { resolveWidgets } from './widgets/registry'

interface WikiArticleProps {
  article: WikiArticleType
  nodeId?: string
  nodeName?: string
  eiPrompts?: EIPrompt[]
  eiResponses?: EIResponseMap
}

/** Derive a URL-safe anchor slug from heading text. */
const toHeadingId = (children: React.ReactNode): string | undefined =>
  children
    ?.toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

// Base HTML overrides + callouts — lightweight, always loaded.
// Widgets are resolved dynamically per-article via the registry.
const baseMdxComponents = {
  // Headings with auto-generated IDs for anchor linking
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 id={toHeadingId(props.children)} {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 id={toHeadingId(props.children)} {...props} />
  ),

  // Tables — prototype wiki-table styling
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="not-prose my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-muted dark:bg-muted" {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-3.5 py-2.5 text-left font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground border-b-[1.5px] border-border" {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-3.5 py-[11px] text-sm text-foreground border-b border-border/60 align-top leading-relaxed [&_strong]:text-foreground [&_strong]:font-semibold last:[&:where(tr:last-child_td)]:border-b-0" {...props} />
  ),

  // Code blocks — horizontal scroll, styled container
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="not-prose my-6 overflow-x-auto rounded-md bg-zinc-950 text-zinc-100 p-4 text-[13px] leading-relaxed font-mono border border-zinc-800"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    return <code {...props} />
  },

  // Callout blocks — available as JSX in MDX content
  Note,
  Warn,
  Warning: Warn,
  Tip,
  Example,
  Callout,

  ExamTip,
  ComparisonTable,
  SubjectSnapshot,

  // Wiki UI spec-v1 components — exam-focused article rendering
  WikiCalloutBox,
  WikiExamTable,
  WikiArticleHero,
  WikiPartHeader,
  WikiChangedPill,
  WikiMistakeCard,
  WikiMistakeList,

  // New spec-v1 components — interactive content blocks
  KeyValues,
  FormulaBlock,
  InlineQuiz,
  Tabs,
  Tab,
  Accordion,
  AccordionItem,

  // EI — direct MDX usage (not DB-driven, uses revealText prop)
  ElaborativeInterrogation,

  // Law citation callouts — color-coded by legal code
  LawCallout,

  // Active recall — blur-to-reveal content block
  RevealBlock,
}

/**
 * Build MDX components with DB-driven EI prompt data injected via closure.
 * EIPrompt components in the MDX content use an index to look up data.
 */
const buildMdxComponents = (
  prompts: EIPrompt[],
  responses: EIResponseMap,
  articleId?: string,
  widgets: Record<string, React.ComponentType<any>> = {},
) => ({
  ...baseMdxComponents,
  ...widgets,

  // DB-driven prompts — injected by injectEIPrompts as <EIPrompt idx={N} />
  EIPrompt: ({ idx }: { idx: number }) => {
    const prompt = prompts[idx]
    if (!prompt) return null
    const response = responses[prompt.prompt_id]
    return (
      <ElaborativeInterrogation
        promptId={prompt.prompt_id}
        question={prompt.prompt_text}
        answer={prompt.reveal_text}
        options={prompt.options}
        articleId={articleId}
        existingResponse={response ?? null}
      />
    )
  },

  // Legacy: inline [EI] tags converted to EIBlock (kept for backward compat)
  EIBlock: (props: { question: string; answer: string; articleId?: string }) => (
    <ElaborativeInterrogation
      promptId=""
      question={props.question}
      answer={props.answer}
      options={[]}
      articleId={props.articleId}
    />
  ),
})

/**
 * Convert JSX expression props ({...}) to JSON string props ("...") for MDX compatibility.
 * MDX (next-mdx-remote) only supports string props — {[...]} and {{...}} expressions
 * are silently dropped. This converts them to escaped JSON strings that components
 * can parse internally via JSON.parse().
 *
 * Uses bracket counting to correctly handle nested structures like:
 *   operands: ["TLA", "PSO%"]  (nested arrays within objects within arrays)
 */
const convertExpressionPropsToStrings = (content: string): string => {
  // Find prop={ patterns and use bracket counting for balanced extraction
  const result: string[] = []
  let i = 0

  while (i < content.length) {
    // Look for propName={ where the next char is [ or {
    const propMatch = content.substring(i).match(/^(\w+)=\{([\[{])/)
    if (!propMatch) {
      result.push(content[i])
      i++
      continue
    }

    const propName = propMatch[1]
    const startBracket = propMatch[2]
    const exprStart = i + propName.length + 2 // skip propName={

    // Count brackets to find the matching close
    let depth = 0
    let j = exprStart
    let inString = false
    let stringChar = ''

    while (j < content.length) {
      const ch = content[j]

      if (inString) {
        if (ch === '\\') { j += 2; continue }
        if (ch === stringChar) inString = false
      } else {
        if (ch === '"' || ch === "'") { inString = true; stringChar = ch }
        else if (ch === '[' || ch === '{') depth++
        else if (ch === ']' || ch === '}') {
          depth--
          if (depth === 0) {
            // Found the matching closing bracket
            const exprValue = content.substring(exprStart, j + 1)
            const escaped = exprValue.replace(/"/g, '&quot;')
            result.push(`${propName}="${escaped}"`)
            i = j + 2 // skip the closing }
            break
          }
        }
      }
      j++
    }

    if (depth !== 0) {
      // Unbalanced — pass through unchanged
      result.push(content[i])
      i++
    }
  }

  return result.join('')
}

/**
 * Strip legacy [EI]...[/EI] markdown tags from content.
 * These are replaced by DB-driven prompts.
 */
const stripLegacyEITags = (content: string): string =>
  content.replace(/\[EI\][\s\S]*?\[\/EI\]/g, '')

/**
 * Inject DB-driven EI prompt placeholders into article content.
 * Matches prompt.insert_after_heading to markdown headings (##, ###, ####).
 * Inserts <EIPrompt idx={N} /> after the matching heading line.
 */
const injectEIPrompts = (content: string, prompts: EIPrompt[]): string => {
  if (prompts.length === 0) return content

  // Group prompt indices by normalized heading text
  const promptsByHeading = new Map<string, number[]>()
  prompts.forEach((prompt, idx) => {
    const key = prompt.insert_after_heading.toLowerCase().trim()
    if (!promptsByHeading.has(key)) {
      promptsByHeading.set(key, [])
    }
    promptsByHeading.get(key)!.push(idx)
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
          result.push(`<EIPrompt idx={${idx}} />`)
          result.push('')
        }
      }
    }
  }

  return result.join('\n')
}

/**
 * Extract headings from article content — used by the page to pass
 * heading data to both the article and the right sidebar ToC.
 */
export const getArticleHeadings = (article: WikiArticleType): TocHeading[] => {
  const content = article.content || ''
  const processedContent = content.replace(/\\n/g, '\n')
  return extractHeadings(processedContent)
}

/**
 * Renders MDX content with a graceful fallback on compilation errors.
 * MDX compilation fails on HTML-like tags starting with numbers (e.g. <1st>, <100mm>).
 */
const MDXContent = async ({
  source,
  components,
}: {
  source: string
  components: ReturnType<typeof buildMdxComponents>
}) => {
  try {
    return (
      <MDXRemote
        source={source}
        components={components}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    )
  } catch {
    // MDX compilation failed (e.g. tags starting with numbers like <1st>, <100mm>).
    // Show the raw content as plain text so the article is still readable.
    return (
      <>
        <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-800">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>Some formatting in this article could not be rendered. Content is shown as plain text.</span>
        </div>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
          {source}
        </pre>
      </>
    )
  }
}

/**
 * Pure content renderer — no sidebars, no header.
 * Renders the article body with prose typography, callout blocks,
 * styled code/tables, text-selection popover, and DB-driven EI prompts.
 */
export const WikiArticle = async ({
  article,
  nodeId,
  nodeName,
  eiPrompts = [],
  eiResponses = {},
}: WikiArticleProps) => {
  if (!article) return null

  const content = article.content || ''
  const rawContent = content.replace(/\\n/g, '\n')
  const cleaned = stripLegacyEITags(rawContent)
    .replace(/<!--[\s\S]*?-->/g, '') // Strip HTML comments — MDX requires {/* */} syntax
  const withStringProps = convertExpressionPropsToStrings(cleaned)
  const processedContent = injectEIPrompts(withStringProps, eiPrompts)

  // Load only the widgets this article actually references
  const widgets = await resolveWidgets(processedContent)

  const mdxComponents = buildMdxComponents(eiPrompts, eiResponses, article.article_id, widgets)

  return (
    <>
      {/* Sets NoteContext so QuickCapture knows which article is open */}
      <WikiNoteAnchor
        article_id={article.article_id}
        article_title={article.title}
        topic_id={nodeId}
        topic_name={nodeName}
        source_url={`/dashboard/wiki/${article.slug}`}
      />

      {/* Client-side logic for highlighting search terms */}
      <Suspense fallback={null}>
        <WikiHighlighter />
      </Suspense>

      {/* Text-selection popover (Highlight, Copy, Add to Notes) */}
      <WikiTextSelection />

      {/* Prose content */}
      <div className="wiki-prose max-w-none mt-8">
        <Suspense
          fallback={
            <div className="animate-pulse bg-muted h-64 w-full rounded-md" />
          }
        >
          {processedContent ? (
            <MDXContent source={processedContent} components={mdxComponents} />
          ) : (
            <p className="text-muted-foreground italic">
              This article has no content yet.
            </p>
          )}
        </Suspense>
      </div>

      {/* "Practice this topic" CTA removed — already available in the right sidebar */}
    </>
  )
}
