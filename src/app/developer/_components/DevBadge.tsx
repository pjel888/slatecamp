import { cn } from '@/lib/utils'

type DevBadgeVariant = 'environment' | 'version' | 'status'

interface DevBadgeProps {
  variant?: DevBadgeVariant
  status?: 'success' | 'warning' | 'error'
  children: React.ReactNode
  className?: string
}

const variantStyles = {
  environment: {
    success: 'bg-emerald-500/15 text-emerald-500',
    warning: 'bg-amber-500/15 text-amber-500',
    error: 'bg-red-500/15 text-red-500',
  },
  version: {
    success: 'bg-muted text-muted-foreground',
    warning: 'bg-muted text-muted-foreground',
    error: 'bg-muted text-muted-foreground',
  },
  status: {
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    error: 'bg-red-500/15 text-red-600 dark:text-red-400',
  },
} as const

export const DevBadge = ({
  variant = 'status',
  status = 'success',
  children,
  className,
}: DevBadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center font-[family-name:var(--font-dm-mono)] text-[9px] font-medium px-1.5 py-0.5 rounded-full',
      variantStyles[variant][status],
      className,
    )}
  >
    {children}
  </span>
)
