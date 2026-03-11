import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
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
          <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={1.5} />
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
          <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
