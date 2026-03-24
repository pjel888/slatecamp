'use client'

import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  message: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

const EmptyState = ({
  icon,
  message,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <p className={cn('text-sm font-medium text-foreground', icon && 'mt-4')}>
        {message}
      </p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex h-8 items-center justify-center rounded-sm px-3 text-sm font-medium text-foreground transition-all duration-150 hover:bg-muted"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex h-8 items-center justify-center rounded-sm px-3 text-sm font-medium text-foreground transition-all duration-150 hover:bg-muted"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export { EmptyState }
export type { EmptyStateProps }
