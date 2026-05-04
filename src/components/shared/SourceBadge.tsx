'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Parses [Source: wiki_slug] tokens from AI text and renders clickable badges
// ---------------------------------------------------------------------------

interface SourceBadgeProps {
  slug: string
  articleId?: string
  className?: string
  onClick?: (slug: string) => void
}

export const SourceBadge = ({ slug, articleId, className, onClick }: SourceBadgeProps) => {
  const label = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const targetId = articleId || slug

  const badge = (
    <Badge
      variant="primary"
      size="xs"
      shape="pill"
      className={cn('font-medium normal-case tracking-normal', className)}
      icon={<ArrowSquareOut size={10} weight="bold" aria-hidden="true" />}
    >
      {label}
    </Badge>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(slug)}
        className="transition-opacity hover:opacity-80 no-underline text-left cursor-pointer"
      >
        {badge}
      </button>
    )
  }

  return (
    <Link
      href={`/dashboard/wiki/${targetId}`}
      className="transition-opacity hover:opacity-80 no-underline"
    >
      {badge}
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Helper: extract [Source: slug] tokens from text
// ---------------------------------------------------------------------------

const SOURCE_PATTERN = /\[Source:\s*([^\]]+)\]/g

export const extractSources = (text: string): string[] => {
  const slugs: string[] = []
  let match: RegExpExecArray | null
  while ((match = SOURCE_PATTERN.exec(text)) !== null) {
    const slug = match[1].trim()
    if (slug && !slugs.includes(slug)) {
      slugs.push(slug)
    }
  }
  return slugs
}

// ---------------------------------------------------------------------------
// Helper: strip [Source: slug] tokens from text for display
// ---------------------------------------------------------------------------

export const stripSources = (text: string): string =>
  text.replace(SOURCE_PATTERN, '').trim()

// ---------------------------------------------------------------------------
// Renders a row of source badges
// ---------------------------------------------------------------------------

interface SourceBadgeRowProps {
  sources: Array<{ slug: string; articleId?: string }>
  onSourceClick?: (slug: string, articleId?: string) => void
}

export const SourceBadgeRow = ({ sources, onSourceClick }: SourceBadgeRowProps) => {
  if (sources.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {sources.map((s) => (
        <SourceBadge key={s.slug} slug={s.slug} articleId={s.articleId} onClick={onSourceClick ? () => onSourceClick(s.slug, s.articleId) : undefined} />
      ))}
    </div>
  )
}
