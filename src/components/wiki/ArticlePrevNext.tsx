'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { ROUTES } from '@/lib/constants/routes'
import type { WikiPage } from '@/types/app'

interface ArticlePrevNextProps {
  prev: Pick<WikiPage, 'title' | 'slug'> | null
  next: Pick<WikiPage, 'title' | 'slug'> | null
}

export function ArticlePrevNext({ prev, next }: ArticlePrevNextProps) {
  if (!prev && !next) return null

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40 gap-4">
      {prev ? (
        <Link
          href={ROUTES.WIKI_PAGE(prev.slug)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors max-w-[45%]"
        >
          <SCIcon icon={ArrowLeft} size="sm" className="shrink-0" />
          <span className="truncate">{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={ROUTES.WIKI_PAGE(next.slug)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-right max-w-[45%]"
        >
          <span className="truncate">{next.title}</span>
          <SCIcon icon={ArrowRight} size="sm" className="shrink-0" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
