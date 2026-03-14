import React, { Suspense } from 'react'
import Link from 'next/link'
import { Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { WikiTableOfContents } from './WikiTableOfContents'
import { extractHeadings } from '@/lib/wiki-markdown'
import type { WikiArticle as WikiArticleType } from '@/types/app'
import { format } from 'date-fns'
import { WikiHighlighter } from './WikiHighlighter'
import PHBuildingSetbacks from '../interactive-illustrations/2D/SetbackIllustration'

interface WikiArticleProps {
  article: WikiArticleType
}

// Custom components for MDX to maintain existing heading ID logic
const components = {
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

export async function WikiArticle({ article }: WikiArticleProps) {
  // Frontend fix: Replace literal \n sequences with actual newlines
  const processedContent = article.content.replace(/\\n/g, '\n')
  const headings = extractHeadings(processedContent)

  return (
    <div className='flex flex-col lg:flex-row w-full h-full overflow-hidden'>
      {/* Client-side logic for highlighting search terms */}
      <Suspense fallback={null}>
        <WikiHighlighter />
      </Suspense>

      {/* Main Content (Scrolling Area) */}
      <article className='flex-1 min-w-0 overflow-y-auto p-4'>
        <header className='mb-8'>
          <div className='flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider'>
            <span>Wiki Article</span>
            <span>•</span>
            <span>
              Updated {format(new Date(article.updated_at), 'MMM d, yyyy')}
            </span>
          </div>
          <div className='flex items-center justify-between mb-4'>
            <h1 className='text-4xl font-bold tracking-tight text-foreground'>
              {article.title}
            </h1>
            <Link href={`/dashboard/testing?articleId=${article.article_id}`}>
              <Button
                size='sm'
                className='bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-6 shadow-lg shadow-blue-100 transition-all active:scale-95'
              >
                <Brain className='mr-2 h-4 w-4' /> Practice this Topic
              </Button>
            </Link>
          </div>
          <div className='h-1 w-20 bg-blue-600/20 rounded-full' />
        </header>

        <div
          className='prose prose-zinc dark:prose-invert max-w-none 
          prose-headings:font-semibold prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-zinc-200 prose-h2:pb-2
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:leading-relaxed prose-p:text-zinc-600
          prose-li:text-zinc-600
          prose-strong:text-zinc-900 prose-strong:font-semibold
          prose-code:bg-zinc-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
          prose-blockquote:border-l-4 prose-blockquote:border-blue-600/20 prose-blockquote:bg-zinc-50 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:rounded-r-lg
        '
        >
          <Suspense
            fallback={
              <div className='animate-pulse bg-zinc-100 h-64 w-full rounded-xl' />
            }
          >
            <MDXRemote source={processedContent} components={components} />
          </Suspense>
        </div>
      </article>

      {/* Secondary Sidebar (Table of Contents - Fixed) */}
      <aside className='hidden lg:block w-64 shrink-0 border-l border-zinc-100 bg-zinc-50/30 overflow-y-auto'>
        <div className='py-10 px-6'>
          <WikiTableOfContents headings={headings} />

          <div className='mt-10 pt-8 border-t border-border/40'>
            <h3 className='text-xs font-semibold text-foreground uppercase tracking-wider mb-4'>
              Resources
            </h3>
            <ul className='space-y-3'>
              <li>
                <button className='text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2'>
                  <span className='w-1.5 h-1.5 rounded-full bg-primary/40' />
                  Cite this article
                </button>
              </li>
              <li>
                <button className='text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2'>
                  <span className='w-1.5 h-1.5 rounded-full bg-primary/40' />
                  Suggest an edit
                </button>
              </li>
              <li>
                <button className='text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2'>
                  <span className='w-1.5 h-1.5 rounded-full bg-primary/40' />
                  Download PDF
                </button>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  )
}
