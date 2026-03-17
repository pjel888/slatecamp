import React, { Suspense } from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { WikiTableOfContents } from './WikiTableOfContents'
import { WikiArticleHeader } from './WikiArticleHeader'
import { extractHeadings } from '@/lib/wiki-markdown'
import type { WikiArticle as WikiArticleType } from '@/types/app'
import { WikiHighlighter } from './WikiHighlighter'
import { WikiNoteAnchor } from './WikiNoteAnchor'
import { WikiArticleResources } from './WikiArticleResources'
import PHBuildingSetbacks from '../interactive-illustrations/2D/SetbackIllustration'

interface WikiArticleProps {
  article: WikiArticleType
  nodeId?: string
  nodeName?: string
}

// Custom components for MDX to maintain existing heading ID logic
const mdxComponents = {
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
  PHBuildingSetbacks: (props: React.HTMLAttributes<HTMLDivElement>) => {
    return <PHBuildingSetbacks {...props} />
  },
}

export async function WikiArticle({ article, nodeId, nodeName }: WikiArticleProps) {
  if (!article) return null

  // Frontend fix: Replace literal \n sequences with actual newlines
  const content = article.content || ''
  const processedContent = content.replace(/\\n/g, '\n')
  const headings = extractHeadings(processedContent)

  const practiceHref = nodeId
    ? `/dashboard/testing?topicId=${nodeId}`
    : `/dashboard/testing?articleId=${article.article_id}`
  const practiceLabel = `Practice this ${nodeName ? 'Topic' : 'Article'}`

  return (
    <div className="flex flex-col lg:flex-row w-full h-full overflow-hidden">
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

      {/* Main Content (Scrolling Area) */}
      <article className="flex-1 min-w-0 overflow-y-auto p-4 border-l border-zinc-200">
        <WikiArticleHeader
          title={article.title}
          updatedAt={article.updated_at}
          practiceHref={practiceHref}
          practiceLabel={practiceLabel}
        />

        <div
          className="prose prose-zinc dark:prose-invert max-w-[75ch]
          prose-headings:font-semibold prose-headings:tracking-tight
          prose-h2:text-lg prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-zinc-200 prose-h2:pb-2
          prose-h3:text-base prose-h3:mt-8 prose-h3:mb-3
          prose-p:leading-relaxed prose-p:text-zinc-600 prose-p:text-sm
          prose-li:text-zinc-600
          prose-strong:text-zinc-900 prose-strong:font-semibold
          prose-code:bg-zinc-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
          prose-blockquote:border-l-4 prose-blockquote:border-primary/20 prose-blockquote:bg-zinc-50 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:rounded-r-md
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
      </article>

      {/* Secondary Sidebar (Table of Contents - Fixed) */}
      <aside className="hidden lg:block w-64 shrink-0 border-l border-zinc-100 bg-zinc-50/30 overflow-y-auto">
        <div className="py-10 px-6">
          <WikiTableOfContents headings={headings} />
          <WikiArticleResources />
        </div>
      </aside>
    </div>
  )
}
