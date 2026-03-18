'use client'

import { format } from 'date-fns'

interface WikiArticleHeaderProps {
  title: string
  updatedAt: string
  /** Estimated reading time in minutes */
  readingTime?: number
}

export function WikiArticleHeader({
  title,
  updatedAt,
  readingTime,
}: WikiArticleHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground mb-3">
        {title}
      </h1>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {readingTime != null && readingTime > 0 && (
          <>
            <span>{readingTime} min read</span>
            <span className="text-zinc-300">&bull;</span>
          </>
        )}
        <span>Updated {format(new Date(updatedAt), 'MMM d, yyyy')}</span>
      </div>
      <div className="h-px w-full bg-zinc-200 mt-4" />
    </header>
  )
}
