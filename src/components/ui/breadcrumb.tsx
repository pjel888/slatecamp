'use client'

import * as React from 'react'
import Link from 'next/link'
import { CaretRight } from '@phosphor-icons/react/dist/ssr'

import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: 'slash' | 'chevron'
  className?: string
  maxItems?: number
}

/* ------------------------------------------------------------------ */
/*  Separator                                                           */
/* ------------------------------------------------------------------ */

const BreadcrumbSeparator = ({ type }: { type: 'slash' | 'chevron' }) => {
  if (type === 'slash') {
    return (
      <span aria-hidden="true" data-slot="breadcrumb-separator" className="text-muted-foreground">
        /
      </span>
    )
  }
  return (
    <CaretRight
      aria-hidden="true"
      data-slot="breadcrumb-separator"
      className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Truncation                                                          */
/* ------------------------------------------------------------------ */

const truncateMiddle = (items: BreadcrumbItem[], maxItems: number): (BreadcrumbItem | 'ellipsis')[] => {
  if (items.length <= maxItems) {
    return items
  }
  return [items[0], 'ellipsis' as const, items[items.length - 2], items[items.length - 1]]
}

/* ------------------------------------------------------------------ */
/*  Breadcrumb                                                          */
/* ------------------------------------------------------------------ */

const Breadcrumb = ({
  items,
  separator = 'chevron',
  className,
  maxItems = 4,
}: BreadcrumbProps) => {
  const displayItems = truncateMiddle(items, maxItems)

  return (
    <nav
      aria-label="Breadcrumb"
      data-slot="breadcrumb"
      className={cn('flex items-center gap-1.5 text-sm', className)}
    >
      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1

        if (item === 'ellipsis') {
          return (
            <span key="ellipsis" className="flex items-center gap-1.5">
              <BreadcrumbSeparator type={separator} />
              <span className="text-muted-foreground" aria-hidden="true">...</span>
            </span>
          )
        }

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && <BreadcrumbSeparator type={separator} />}
            {isLast || !item.href ? (
              <span className="flex items-center gap-1 text-foreground font-medium">
                {item.icon}
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-1 text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
              >
                {item.icon}
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export { Breadcrumb, BreadcrumbSeparator }
export type { BreadcrumbItem, BreadcrumbProps }
