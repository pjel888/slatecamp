import React, { Suspense } from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { extractHeadings } from '@/lib/wiki-markdown'
import type { WikiArticle as WikiArticleType } from '@/types/app'
import type { TocHeading } from '@/lib/wiki-markdown'
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
}

// Custom components for MDX rendering
const mdxComponents = {
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
    // Inline code (inside a <p>) vs block code (inside <pre>) is distinguished
    // by whether the parent is <pre>. MDXRemote handles this — inline code
    // gets prose styling from the wrapper, block code gets <pre> styling above.
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

  // Elaborative Interrogation blocks
  EIBlock: (props: { question: string; answer: string; articleId?: string }) => {
    return (
      <ElaborativeInterrogation
        question={props.question}
        answer={props.answer}
        articleId={props.articleId}
      />
    )
  },
}

/**
 * Pre-processes wiki content to convert [EI]...[/EI] tags into
 * <EIBlock> JSX components for Elaborative Interrogation.
 */
const preprocessEITags = (content: string, articleId?: string): string => {
  // Match [EI]question[/EI] followed by content until the next heading, EI tag, or end
  const eiRegex = /\[EI\]([\s\S]*?)\[\/EI\]/g
  return content.replace(eiRegex, (_match, question: string) => {
    const trimmedQuestion = question.trim()
    // Escape quotes for JSX attribute
    const escapedQuestion = trimmedQuestion.replace(/"/g, '&quot;')
    const escapedArticleId = articleId ? ` articleId="${articleId}"` : ''
    // The answer will be revealed from the content that follows naturally
    // We use a simple approach: the EI block is self-contained
    return `<EIBlock question="${escapedQuestion}" answer=""${escapedArticleId} />`
  })
}

/**
 * Extract headings from article content — used by the page to pass
 * heading data to both the article and the right sidebar ToC.
 */
export function getArticleHeadings(article: WikiArticleType): TocHeading[] {
  const content = article.content || ''
  const processedContent = content.replace(/\\n/g, '\n')
  return extractHeadings(processedContent)
}

/**
 * Pure content renderer — no sidebars, no header.
 * Renders the article body with prose typography, callout blocks,
 * styled code/tables, and text-selection popover.
 */
export async function WikiArticle({ article, nodeId, nodeName }: WikiArticleProps) {
  if (!article) return null

  const content = article.content || ''
  const rawContent = content.replace(/\\n/g, '\n')
  const processedContent = preprocessEITags(rawContent, article.article_id)

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
    </>
  )
}
