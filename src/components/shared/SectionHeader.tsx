import Link from 'next/link'

import { cn } from '@/lib/utils'

interface SectionHeaderAction {
  label: string
  href: string
}

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: SectionHeaderAction
  className?: string
}

export const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  action,
  className,
}: SectionHeaderProps) => (
  <div className={cn('flex items-start justify-between', className)}>
    <div className="flex flex-col">
      {eyebrow && (
        <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
          {eyebrow}
        </span>
      )}
      <h2 className="font-[var(--font-display)] font-semibold text-base text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
    {action && (
      <Link
        href={action.href}
        className="shrink-0 text-sm text-primary hover:underline transition-colors duration-150 ease-out"
      >
        {action.label}
      </Link>
    )}
  </div>
)

export type { SectionHeaderProps, SectionHeaderAction }
