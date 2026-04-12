import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  /** Slot for actions (buttons, links, etc) */
  action?: React.ReactNode
  className?: string
  /** If true, wraps the empty state in a dashed Card (common for charts) */
  variant?: 'default' | 'card'
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
  variant = 'default',
}: EmptyStateProps) => {
  const content = (
    <div
      data-slot="empty-state"
      className={cn(
        'flex flex-col items-center justify-center text-center animate-in fade-in duration-300',
        variant === 'default' && 'py-12',
        variant === 'card' && 'h-full p-4',
        className,
      )}
    >
      {icon && (
        <div 
          data-slot="empty-state-icon"
          className={cn(
            "flex items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform duration-300 hover:scale-105",
            variant === 'default' ? "h-12 w-12" : "h-10 w-10 mb-2"
          )}
        >
          {icon}
        </div>
      )}
      
      {title && (
        <h3 
          data-slot="empty-state-title"
          className={cn(
            'text-sm font-medium text-foreground', 
            icon && variant === 'default' && 'mt-4'
          )}
        >
          {title}
        </h3>
      )}
      
      {description && (
        <p 
          data-slot="empty-state-description"
          className={cn(
            "max-w-sm text-xs text-muted-foreground leading-relaxed",
            variant === 'default' ? "mt-1" : "mt-0.5"
          )}
        >
          {description}
        </p>
      )}
      
      {action && (
        <div 
          data-slot="empty-state-action"
          className={variant === 'default' ? "mt-6" : "mt-3"}
        >
          {action}
        </div>
      )}
    </div>
  )

  if (variant === 'card') {
    return (
      <Card className="border-dashed border-border/50 h-full flex flex-col justify-center">
        <CardContent className="p-0">
          {content}
        </CardContent>
      </Card>
    )
  }

  return content
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
