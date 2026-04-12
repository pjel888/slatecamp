import * as React from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { BarChart3, type LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface ChartEmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  height?: string // Height is now handled by the container or variant='card'
  ctaText?: string
  ctaHref?: string
}

/**
 * @deprecated Use EmptyState with variant="card" directly.
 * This remains as a shim for existing analytics components.
 */
export const ChartEmptyState = ({
  title,
  description,
  icon: Icon = BarChart3,
  ctaText,
  ctaHref,
}: ChartEmptyStateProps) => {
  return (
    <EmptyState
      variant="card"
      icon={<Icon className="w-5 h-5" />}
      title={title}
      description={description}
      action={ctaText && ctaHref ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={ctaHref}>{ctaText}</Link>
        </Button>
      ) : undefined}
    />
  )
}
