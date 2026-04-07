'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  List Group Root                                                     */
/* ------------------------------------------------------------------ */

const listGroupVariants = cva(
  'w-full text-sm font-medium text-foreground bg-card border border-border rounded-sm overflow-hidden',
  {
    variants: {
      variant: {
        default: '',
        flush: 'border-x-0 rounded-none',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface ListGroupProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof listGroupVariants> {}

const ListGroup = React.forwardRef<HTMLUListElement, ListGroupProps>(
  ({ className, variant, ...props }, ref) => (
    <ul
      ref={ref}
      role="list"
      data-slot="list-group"
      className={cn(listGroupVariants({ variant }), className)}
      {...props}
    />
  ),
)
ListGroup.displayName = 'ListGroup'

/* ------------------------------------------------------------------ */
/*  List Group Item                                                     */
/* ------------------------------------------------------------------ */

interface ListGroupItemProps extends React.HTMLAttributes<HTMLLIElement> {
  icon?: React.ReactNode
  trailing?: React.ReactNode
  active?: boolean
  disabled?: boolean
  interactive?: boolean
}

const ListGroupItem = React.forwardRef<HTMLLIElement, ListGroupItemProps>(
  ({ className, icon, trailing, active, disabled, interactive, children, onClick, ...props }, ref) => {
    const baseClasses = cn(
      'flex items-center gap-2 w-full px-4 py-2.5 border-b border-border last:border-b-0',
      'transition-colors duration-150 ease-out',
      active && 'bg-muted text-primary font-medium',
      disabled && 'text-muted-foreground cursor-not-allowed opacity-60',
      interactive && !disabled && 'cursor-pointer hover:bg-muted/50 hover:text-primary',
      interactive && !disabled && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-inset',
      className,
    )

    const content = (
      <>
        {icon && (
          <span data-slot="list-group-icon" className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        )}
        <span data-slot="list-group-content" className="flex-1 min-w-0 truncate">
          {children}
        </span>
        {trailing && (
          <span data-slot="list-group-trailing" className="shrink-0 ml-auto">
            {trailing}
          </span>
        )}
      </>
    )

    if (interactive && !disabled) {
      return (
        <li
          ref={ref}
          role="button"
          tabIndex={0}
          data-slot="list-group-item"
          className={baseClasses}
          onClick={onClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onClick?.(e as unknown as React.MouseEvent<HTMLLIElement>)
            }
          }}
          aria-disabled={disabled}
          aria-current={active ? 'true' : undefined}
          {...props}
        >
          {content}
        </li>
      )
    }

    return (
      <li
        ref={ref}
        data-slot="list-group-item"
        className={baseClasses}
        aria-disabled={disabled}
        aria-current={active ? 'true' : undefined}
        {...props}
      >
        {content}
      </li>
    )
  },
)
ListGroupItem.displayName = 'ListGroupItem'

export { ListGroup, ListGroupItem, listGroupVariants }
export type { ListGroupProps, ListGroupItemProps }
