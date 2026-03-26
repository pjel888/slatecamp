'use client'

import Link from 'next/link'
import { ArrowSquareOut } from '@phosphor-icons/react'

// ---------------------------------------------------------------------------
// Parses [Source: wiki_slug] tokens from AI text and renders clickable badges
// ---------------------------------------------------------------------------

interface SourceBadgeProps {
  slug: string
  className?: string
}

export const SourceBadge = ({ slug, className }: SourceBadgeProps) => {
  const label = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <Link
      href={`/dashboard/wiki/${slug}`}
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
        'bg-[#EEF2FC] text-[#1B3FC4] text-[11px] font-medium leading-tight',
        'hover:bg-[#1B3FC4]/15 transition-colors duration-150 ease-out',
        'no-underline',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ArrowSquareOut size={10} weight="bold" aria-hidden="true" />
      {label}
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
  sources: string[]
}

export const SourceBadgeRow = ({ sources }: SourceBadgeRowProps) => {
  if (sources.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {sources.map((slug) => (
        <SourceBadge key={slug} slug={slug} />
      ))}
    </div>
  )
}
