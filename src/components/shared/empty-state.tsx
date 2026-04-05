import * as React from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  /** Slot for actions (buttons, links, etc) */
  action?: React.ReactNode
  className?: string
}

/**
 * Unified EmptyState component using a slots pattern.
 * Works in both server and client contexts.
 * 
 * NEVER use generic messages like: "No data found." / "Empty"
 * ALWAYS use honest observations and clear next steps.
 */
const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-300',
        className,
      )}
    >
      {icon && (
        <div 
          data-slot="empty-state-icon"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform duration-300 hover:scale-105"
        >
          {icon}
        </div>
      )}
      
      {title && (
        <h3 
          data-slot="empty-state-title"
          className={cn('text-sm font-medium text-foreground', icon && 'mt-4')}
        >
          {title}
        </h3>
      )}
      
      {description && (
        <p 
          data-slot="empty-state-description"
          className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed"
        >
          {description}
        </p>
      )}
      
      {action && (
        <div 
          data-slot="empty-state-action"
          className="mt-6"
        >
          {action}
        </div>
      )}
    </div>
  )
}

/**
 * Sub-components for compound pattern
 */
export const EmptyStateTitle = ({ className, ...props }: React.ComponentProps<'h3'>) => (
  <h3 className={cn("text-sm font-medium text-foreground", className)} {...props} />
)

export const EmptyStateDescription = ({ className, ...props }: React.ComponentProps<'p'>) => (
  <p className={cn("mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed", className)} {...props} />
)

export { EmptyState }
export type { EmptyStateProps }
