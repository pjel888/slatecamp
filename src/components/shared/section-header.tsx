import * as React from 'react'

import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: React.ReactNode
  level?: 'page' | 'section' | 'card'
  className?: string
}

const levelStyles = {
  page: {
    eyebrow:
      "font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground",
    title:
      "font-[family-name:var(--font-display)] font-extrabold text-xl",
    subtitle: "text-sm text-muted-foreground",
  },
  section: {
    eyebrow:
      "font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground",
    title: "font-sans font-medium text-base",
    subtitle: "text-xs text-muted-foreground",
  },
  card: {
    eyebrow:
      "font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5",
    title: "font-sans font-medium text-sm",
    subtitle: "text-xs text-muted-foreground",
  },
} as const

const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  action,
  level = 'section',
  className,
}: SectionHeaderProps) => {
  const styles = levelStyles[level]

  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div className="flex flex-col">
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export { SectionHeader }
export type { SectionHeaderProps }
