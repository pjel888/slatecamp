'use client'

import * as React from 'react'
import { CaretLeft, CaretRight, DotsThree } from '@phosphor-icons/react/dist/ssr'

import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Pagination Root                                                     */
/* ------------------------------------------------------------------ */

const Pagination = ({
  className,
  ...props
}: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="Pagination"
    data-slot="pagination"
    className={cn('flex justify-center', className)}
    {...props}
  />
)

/* ------------------------------------------------------------------ */
/*  Pagination Content                                                  */
/* ------------------------------------------------------------------ */

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-slot="pagination-content"
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
))
PaginationContent.displayName = 'PaginationContent'

/* ------------------------------------------------------------------ */
/*  Pagination Item                                                     */
/* ------------------------------------------------------------------ */

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-slot="pagination-item"
    className={cn('', className)}
    {...props}
  />
))
PaginationItem.displayName = 'PaginationItem'

/* ------------------------------------------------------------------ */
/*  Pagination Link                                                     */
/* ------------------------------------------------------------------ */

interface PaginationLinkProps extends React.ComponentProps<'button'> {
  isActive?: boolean
}

const PaginationLink = ({
  className,
  isActive,
  ...props
}: PaginationLinkProps) => (
  <button
    type="button"
    aria-current={isActive ? 'page' : undefined}
    data-slot="pagination-link"
    className={cn(
      'inline-flex h-9 w-9 items-center justify-center rounded-sm text-sm font-medium transition-colors duration-150 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2',
      isActive
        ? 'bg-primary text-white'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      className,
    )}
    {...props}
  />
)

/* ------------------------------------------------------------------ */
/*  Previous / Next                                                     */
/* ------------------------------------------------------------------ */

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<'button'>) => (
  <button
    type="button"
    aria-label="Go to previous page"
    data-slot="pagination-previous"
    className={cn(
      'inline-flex h-9 items-center justify-center gap-1 rounded-sm px-3 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out',
      'hover:bg-muted hover:text-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <CaretLeft className="h-4 w-4" aria-hidden="true" />
    <span className="hidden sm:inline">Previous</span>
  </button>
)

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<'button'>) => (
  <button
    type="button"
    aria-label="Go to next page"
    data-slot="pagination-next"
    className={cn(
      'inline-flex h-9 items-center justify-center gap-1 rounded-sm px-3 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out',
      'hover:bg-muted hover:text-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="hidden sm:inline">Next</span>
    <CaretRight className="h-4 w-4" aria-hidden="true" />
  </button>
)

/* ------------------------------------------------------------------ */
/*  Ellipsis                                                            */
/* ------------------------------------------------------------------ */

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    data-slot="pagination-ellipsis"
    className={cn(
      'inline-flex h-9 w-9 items-center justify-center text-muted-foreground',
      className,
    )}
    {...props}
  >
    <DotsThree className="h-4 w-4" weight="bold" />
    <span className="sr-only">More pages</span>
  </span>
)

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
export type { PaginationLinkProps }
