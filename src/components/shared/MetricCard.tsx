import Link from 'next/link'

import { cn } from '@/lib/utils'

interface MetricCardDelta {
  value: number
  direction: 'up' | 'down' | 'flat'
  period: string
}

interface MetricCardProps {
  eyebrow: string
  value: string | number
  label?: string
  delta?: MetricCardDelta
  status?: 'success' | 'warning' | 'neutral'
  href?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const valueSizeMap = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
} as const

const statusBorderMap = {
  success: 'border-l-4 border-l-success',
  warning: 'border-l-4 border-l-warning',
  neutral: '',
} as const

const MetricCardInner = ({
  eyebrow,
  value,
  label,
  delta,
  status = 'neutral',
  size = 'md',
}: Omit<MetricCardProps, 'href' | 'className'>) => (
  <>
    <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
      {eyebrow}
    </p>
    <p
      className={cn(
        'font-mono tabular-nums font-semibold text-foreground',
        valueSizeMap[size],
      )}
    >
      {value}
    </p>
    {label && (
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    )}
    {delta && (
      <p
        className={cn(
          'mt-1.5 text-[12px] font-medium flex items-center gap-0.5',
          delta.direction === 'up' && 'text-success',
          (delta.direction === 'down' || delta.direction === 'flat') &&
            'text-muted-foreground',
        )}
      >
        <span aria-hidden="true">
          {delta.direction === 'up' && '↑'}
          {delta.direction === 'down' && '↓'}
          {delta.direction === 'flat' && '–'}
        </span>
        <span>
          {delta.value} {delta.period}
        </span>
      </p>
    )}
  </>
)

export const MetricCard = ({
  eyebrow,
  value,
  label,
  delta,
  status = 'neutral',
  href,
  size = 'md',
  className,
}: MetricCardProps) => {
  const baseClasses = cn(
    'bg-card border border-border rounded-md p-4',
    status !== 'neutral' && statusBorderMap[status],
    className,
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          baseClasses,
          'block hover:shadow-sm transition-shadow duration-150 ease-out',
        )}
      >
        <MetricCardInner
          eyebrow={eyebrow}
          value={value}
          label={label}
          delta={delta}
          status={status}
          size={size}
        />
      </Link>
    )
  }

  return (
    <div className={baseClasses}>
      <MetricCardInner
        eyebrow={eyebrow}
        value={value}
        label={label}
        delta={delta}
        status={status}
        size={size}
      />
    </div>
  )
}

export type { MetricCardProps, MetricCardDelta }
