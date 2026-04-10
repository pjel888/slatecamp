import * as React from 'react'
import Link from 'next/link'
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import { Card, type CardProps } from '@/components/ui/card'

interface StatCardProps extends Omit<CardProps, 'content'> {
  eyebrow?: React.ReactNode
  value?: React.ReactNode
  trend?: { direction: 'up' | 'down' | 'flat'; label: React.ReactNode }
  color?: string // Tailwind text color class for the value
  href?: string // Make card clickable
  subtitle?: React.ReactNode
}

const trendConfig = {
  up: {
    icon: TrendUp,
    className: 'text-emerald-600 dark:text-emerald-400',
  },
  down: {
    icon: TrendDown,
    className: 'text-amber-600 dark:text-amber-400',
  },
  flat: {
    icon: Minus,
    className: 'text-muted-foreground',
  },
} as const

/**
 * StatCard component built on top of the UI Card primitive.
 * Supports polymorphic slots for eyebrow, value, trend, and subtitle.
 */
const StatCard = ({
  eyebrow,
  value,
  trend,
  color,
  href,
  subtitle,
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: StatCardProps) => {
  const TrendIcon = trend ? trendConfig[trend.direction].icon : null

  const content = (
    <>
      {eyebrow && (
        <span
          data-slot="stat-eyebrow"
          className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
        >
          {eyebrow}
        </span>
      )}
      {value !== undefined && (
        <span
          data-slot="stat-value"
          className={cn(
            'font-mono text-2xl font-bold tabular-nums mt-1',
            color ?? 'text-foreground'
          )}
        >
          {value}
        </span>
      )}
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
      {children}
    </>
  )

  if (href) {
    return (
      <Card
        asChild
        variant="interactive"
        size={size}
        className={className}
        {...props}
      >
        <Link href={href} data-slot="stat-card">
          {content}
        </Link>
      </Card>
    )
  }

  return (
    <Card
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {content}
    </Card>
  )
}

/**
 * Export sub-components for compound pattern if needed.
 */
export const StatCardEyebrow = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    className={cn("font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground", className)}
    {...props}
  />
)

export const StatCardValue = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    className={cn("font-mono text-2xl font-bold tabular-nums mt-1 text-foreground", className)}
    {...props}
  />
)

export { StatCard }
export type { StatCardProps }
