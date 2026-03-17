'use client'

import Link from 'next/link'
import { Clock } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { ROUTES } from '@/lib/constants/routes'
import type { WikiPage } from '@/types/app'

interface RecentlyUpdatedStripProps {
  pages: Pick<WikiPage, 'id' | 'title' | 'slug' | 'updated_at'>[]
}

export function RecentlyUpdatedStrip({ pages }: RecentlyUpdatedStripProps) {
  if (pages.length === 0) return null

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <SCIcon icon={Clock} size="xs" className="text-muted-foreground" />
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Recently Updated
        </h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {pages.map((page) => (
          <Link
            key={page.id}
            href={ROUTES.WIKI_PAGE(page.slug)}
            className="flex-none rounded-full border border-border/40 px-3 py-1.5 text-xs text-muted-foreground whitespace-nowrap transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {page.title}
          </Link>
        ))}
      </div>
    </div>
  )
}
