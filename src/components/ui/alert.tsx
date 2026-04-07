'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from '@phosphor-icons/react/dist/ssr'

import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative flex items-start gap-3 rounded-sm p-4 text-sm [&>svg]:shrink-0 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:mt-0.5',
  {
    variants: {
      variant: {
        default:
          'bg-muted text-foreground border border-border',
        info: 'bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary/10 dark:text-primary-300 dark:border-primary/20',
        destructive:
          'bg-destructive-50 text-destructive-700 border border-destructive-200 dark:bg-destructive/10 dark:text-destructive-300 dark:border-destructive/20',
        success:
          'bg-success-50 text-success-700 border border-success-200 dark:bg-success/10 dark:text-success-300 dark:border-success/20',
        warning:
          'bg-warning-50 text-warning-700 border border-warning-200 dark:bg-warning/10 dark:text-warning-300 dark:border-warning/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, icon, dismissible, onDismiss, children, ...props }, ref) => {
    const [dismissed, setDismissed] = React.useState(false)

    if (dismissed) return null

    const handleDismiss = () => {
      setDismissed(true)
      onDismiss?.()
    }

    return (
      <div
        ref={ref}
        role="alert"
        data-slot="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {icon}
        <div data-slot="alert-content" className="flex-1 min-w-0">
          {children}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 rounded-sm p-0.5 opacity-70 transition-opacity duration-150 ease-out hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    )
  },
)
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    data-slot="alert-title"
    className={cn('font-medium leading-tight', className)}
    {...props}
  />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="alert-description"
    className={cn('mt-1 text-sm opacity-90', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription, alertVariants }
export type { AlertProps }
