import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: 'slash' | 'chevron'
  className?: string
}

const Separator = ({ type }: { type: 'slash' | 'chevron' }) => {
  if (type === 'slash') {
    return (
      <span aria-hidden="true" className="text-muted-foreground">
        /
      </span>
    )
  }
  return (
    <ChevronRight
      aria-hidden="true"
      className="h-3.5 w-3.5 text-muted-foreground"
    />
  )
}

const truncateMiddle = (items: BreadcrumbItem[]): (BreadcrumbItem | 'ellipsis')[] => {
  if (items.length <= 4) {
    return items
  }
  return [items[0], 'ellipsis' as const, items[items.length - 2], items[items.length - 1]]
}

const Breadcrumb = ({
  items,
  separator = 'chevron',
  className,
}: BreadcrumbProps) => {
  const displayItems = truncateMiddle(items)

  return (
    <nav aria-label="Breadcrumb" data-slot="breadcrumb" className={cn('flex items-center gap-1.5 text-sm', className)}>
      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1

        if (item === 'ellipsis') {
          return (
            <span key="ellipsis" className="flex items-center gap-1.5">
              <Separator type={separator} />
              <span className="text-muted-foreground">...</span>
            </span>
          )
        }

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && <Separator type={separator} />}
            {isLast || !item.href ? (
              <span className="text-foreground font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export { Breadcrumb }
export type { BreadcrumbItem, BreadcrumbProps }
