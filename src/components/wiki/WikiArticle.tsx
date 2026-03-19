import React, { Suspense } from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { extractHeadings } from '@/lib/wiki-markdown'
import type { WikiArticle as WikiArticleType } from '@/types/app'
import type { TocHeading } from '@/lib/wiki-markdown'
import type { EIPrompt, EIResponseMap } from '@/lib/actions/ei-prompts'
import { WikiHighlighter } from './WikiHighlighter'
import { WikiNoteAnchor } from './WikiNoteAnchor'
import { WikiTextSelection } from './WikiTextSelection'
import { Note, Warn, Tip, Example, Callout } from './WikiCallout'
import PHBuildingSetbacks from '../interactive-illustrations/2D/SetbackIllustration'
import { ElaborativeInterrogation } from './ElaborativeInterrogation'

interface WikiArticleProps {
  article: WikiArticleType
  nodeId?: string
  nodeName?: string
  eiPrompts?: EIPrompt[]
  eiResponses?: EIResponseMap
}

// Base custom components for MDX rendering (no EI — those are added dynamically)
const baseMdxComponents = {
  // Headings with auto-generated IDs for anchor linking
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = props.children
      ?.toString()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
    return <h2 id={id} {...props} />
  },
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = props.children
      ?.toString()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
    return <h3 id={id} {...props} />
  },

  // Tables — horizontal scroll wrapper
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="not-prose my-6 overflow-x-auto rounded-md border border-zinc-200">
      <table className="min-w-full text-sm" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-zinc-50 border-b border-zinc-200" {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-700 uppercase tracking-wider" {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-2.5 text-sm text-zinc-600 border-t border-zinc-100" {...props} />
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

  // Interactive illustrations
  PHBuildingSetbacks: (props: React.HTMLAttributes<HTMLDivElement>) => {
    return <PHBuildingSetbacks {...props} />
  },
}

/**
 * Build MDX components with DB-driven EI prompt data injected via closure.
 * EIPrompt components in the MDX content use an index to look up data.
 */
const buildMdxComponents = (
  prompts: EIPrompt[],
  responses: EIResponseMap,
  articleId?: string,
) => ({
  ...baseMdxComponents,

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
  const processedContent = injectEIPrompts(cleaned, eiPrompts)

  const mdxComponents = buildMdxComponents(eiPrompts, eiResponses, article.article_id)

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
      <div
        className="
          prose prose-zinc dark:prose-invert max-w-none
          prose-headings:font-semibold prose-headings:tracking-tight
          prose-h2:text-lg prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-zinc-200 prose-h2:pb-2
          prose-h3:text-base prose-h3:mt-8 prose-h3:mb-3
          prose-h4:text-sm prose-h4:mt-6 prose-h4:mb-2
          prose-p:leading-relaxed prose-p:text-[#4A5568] prose-p:text-sm
          prose-li:text-[#4A5568] prose-li:text-sm prose-li:leading-relaxed
          prose-ul:my-4 prose-ol:my-4
          prose-strong:text-[#1A2332] prose-strong:font-semibold
          prose-a:text-[#1B3FC4] prose-a:no-underline hover:prose-a:underline
          prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
          prose-blockquote:border-l-4 prose-blockquote:border-[#1B3FC4]/20 prose-blockquote:bg-[#F8F7F5] prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:rounded-r-md prose-blockquote:not-italic
          prose-img:rounded-md prose-img:border prose-img:border-zinc-200
          prose-hr:border-zinc-200
        "
      >
        <Suspense
          fallback={
            <div className="animate-pulse bg-zinc-100 h-64 w-full rounded-md" />
          }
        >
          {processedContent ? (
            <MDXRemote source={processedContent} components={mdxComponents} />
          ) : (
            <p className="text-muted-foreground italic">
              This article has no content yet.
            </p>
          )}
        </Suspense>
      </div>

      {/* End-of-article CTA — UX Strategy Section 6: "Every Wiki read should end with a quiz" */}
      {nodeId && (
        <div className="mt-10 rounded-md border border-[#1B3FC4] bg-[#EEF2FC] p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#1A2332]">
              Test what you just read
            </p>
            <p className="text-xs text-[#4A5568] mt-0.5">
              5 questions on this topic — reinforces what you learned.
            </p>
          </div>
          <a
            href={`/dashboard/testing?topics=${nodeId}`}
            className="shrink-0 rounded-sm bg-[#1B3FC4] px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
          >
            Start Quiz &rarr;
          </a>
        </div>
      )}
    </>
  )
}
