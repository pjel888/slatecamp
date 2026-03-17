'use client'

import Link from 'next/link'
import { Brain } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface WikiArticleHeaderProps {
  title: string
  updatedAt: string
  practiceHref: string
  practiceLabel: string
}

export function WikiArticleHeader({
  title,
  updatedAt,
  practiceHref,
  practiceLabel,
}: WikiArticleHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
        <span>Wiki Article</span>
        <span>&bull;</span>
        <span>Updated {format(new Date(updatedAt), 'MMM d, yyyy')}</span>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <Link href={practiceHref}>
          <Button
            size="sm"
            className="bg-primary hover:bg-[#2F5A85] text-white font-bold rounded-sm px-6 shadow-sm transition-all active:scale-95"
          >
            <SCIcon icon={Brain} size="sm" className="mr-2" /> {practiceLabel}
          </Button>
        </Link>
      </div>
      <div className="h-px w-full bg-zinc-200" />
    </header>
  )
}
