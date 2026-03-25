import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  StatCard — Server Component                                         */
/*  Displays a single stat with eyebrow label, large value, and        */
/*  optional delta, subtitle, tooltip, and link wrapping.              */
/* ------------------------------------------------------------------ */

interface StatCardDelta {
  value: number
  period: string
}

interface StatCardProps {
  eyebrow: string
  title: string
  value: string | number
  delta?: StatCardDelta
  subtitle?: string
  tooltip?: string
  href?: string
}

const StatCardInner = ({
  eyebrow,
  title,
  value,
  delta,
  subtitle,
  tooltip,
}: Omit<StatCardProps, 'href'>) => (
  <div className="flex flex-col gap-1">
    {/* Eyebrow */}
    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
      {eyebrow}
    </span>

    {/* Title */}
    <span className="font-sans font-medium text-sm text-foreground">
      {title}
    </span>

    {/* Value */}
    <span
      className="font-mono font-medium tabular-nums text-2xl text-foreground"
      title={tooltip}
    >
      {value}
    </span>

    {/* Delta */}
    {delta !== undefined && (
      <span
        className={
          delta.value >= 0
            ? 'text-warning text-xs font-mono tabular-nums'
            : 'text-muted-foreground text-xs font-mono tabular-nums'
        }
      >
        {delta.value >= 0 ? '+' : ''}
        {delta.value} {delta.period}
      </span>
    )}

    {/* Subtitle */}
    {subtitle && (
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    )}
  </div>
)

export const StatCard = ({
  eyebrow,
  title,
  value,
  delta,
  subtitle,
  tooltip,
  href,
}: StatCardProps) => {
  const inner = (
    <StatCardInner
      eyebrow={eyebrow}
      title={title}
      value={value}
      delta={delta}
      subtitle={subtitle}
      tooltip={tooltip}
    />
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block bg-card border border-border rounded-md p-4 transition-shadow duration-150 ease-out hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {inner}
      </Link>
    )
  }

  return (
    <div className="bg-card border border-border rounded-md p-4">
      {inner}
    </div>
  )
}

export type { StatCardProps }
