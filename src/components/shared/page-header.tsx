import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
  className?: string
}

export const PageHeader = ({
  title,
  subtitle,
  backHref,
  backLabel,
  actions,
  className,
}: PageHeaderProps) => (
  <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
    <div className="space-y-1">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLabel || 'Back'}
        </Link>
      )}
      <h1 className="text-lg font-bold text-foreground">{title}</h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
    {actions && (
      <div className="flex items-center gap-2 shrink-0">{actions}</div>
    )}
  </div>
)
