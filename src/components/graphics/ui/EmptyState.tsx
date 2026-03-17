import { cn } from '@/lib/utils'

interface EmptyStateProps {
  illustration: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * EmptyState — Composition + message + optional CTA for empty/zero-data screens.
 * Uses a graphic composition as the visual anchor.
 */
export function EmptyState({
  illustration,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-12 text-center', className)}>
      <div className="w-40 h-28">
        {illustration}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[var(--text-secondary)] max-w-xs">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
