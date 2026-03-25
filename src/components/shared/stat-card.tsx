import * as React from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  eyebrow: string
  value: number | string
  trend?: { direction: 'up' | 'down' | 'flat'; label: string }
  color?: string // Tailwind text color class for the number
  href?: string // Make card clickable
  subtitle?: string
  className?: string
}

const trendConfig = {
  up: {
    icon: TrendingUp,
    className: 'text-emerald-600 dark:text-emerald-400',
  },
  down: {
    icon: TrendingDown,
    className: 'text-amber-600 dark:text-amber-400',
  },
  flat: {
    icon: Minus,
    className: 'text-muted-foreground',
  },
} as const

const StatCard = ({
  eyebrow,
  value,
  trend,
  color,
  href,
  subtitle,
  className,
}: StatCardProps) => {
  const TrendIcon = trend ? trendConfig[trend.direction].icon : null

  const content = (
    <>
      <span
        data-slot="stat-eyebrow"
        className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
      >
        {eyebrow}
      </span>
      <span
        data-slot="stat-value"
        className={cn(
          'font-mono text-2xl font-bold tabular-nums mt-1',
          color ?? 'text-foreground'
        )}
      >
        {value}
      </span>
      {trend && TrendIcon && (
        <span
          data-slot="stat-trend"
          className={cn(
            'flex items-center gap-1 text-xs mt-1',
            trendConfig[trend.direction].className
          )}
        >
          <TrendIcon className="h-3 w-3" />
          {trend.label}
        </span>
      )}
      {subtitle && (
        <span
          data-slot="stat-subtitle"
          className="text-xs text-muted-foreground mt-0.5"
        >
          {subtitle}
        </span>
      )}
    </>
  )

  const containerClasses = cn(
    'rounded-md border border-border bg-card p-4 flex flex-col',
    href && 'hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer',
    className
  )

  if (href) {
    return (
      <Link href={href} data-slot="stat-card" className={containerClasses}>
        {content}
      </Link>
    )
  }

  return (
    <div data-slot="stat-card" className={containerClasses}>
      {content}
    </div>
  )
}

export { StatCard }
export type { StatCardProps }
