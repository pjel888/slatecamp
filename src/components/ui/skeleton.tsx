import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const scoreRingSkeletonVariants = cva('rounded-full', {
  variants: {
    size: {
      sm: 'h-10 w-10',
      md: 'h-16 w-16',
      lg: 'h-24 w-24',
      xl: 'h-32 w-32',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn('animate-pulse rounded-sm bg-muted', className)}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

type CardSkeletonProps = React.ComponentProps<'div'>

const CardSkeleton = ({ className, ...props }: CardSkeletonProps) => (
  <div data-slot="card-skeleton" className={cn('space-y-3 rounded-lg border border-border p-4', className)} {...props}>
    <Skeleton className="h-3 w-20" />
    <Skeleton className="h-5 w-48" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
)

type TableRowSkeletonProps = React.ComponentProps<'div'> & {
  columns?: number
}

const TableRowSkeleton = ({
  columns = 4,
  className,
  ...props
}: TableRowSkeletonProps) => (
  <div data-slot="table-row-skeleton" className={cn('flex items-center gap-4 border-b border-border px-4 py-3', className)} {...props}>
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} className={cn('h-4', i === 0 ? 'w-48' : 'w-24')} />
    ))}
  </div>
)

type StatCardSkeletonProps = React.ComponentProps<'div'>

const StatCardSkeleton = ({ className, ...props }: StatCardSkeletonProps) => (
  <div data-slot="stat-card-skeleton" className={cn('space-y-2 rounded-lg border border-border p-4', className)} {...props}>
    <Skeleton className="h-2.5 w-16" />
    <Skeleton className="h-8 w-20" />
    <Skeleton className="h-3 w-24" />
  </div>
)

type ArticleListSkeletonProps = React.ComponentProps<'div'> & {
  rows?: number
}

const ArticleListSkeleton = ({
  rows = 5,
  className,
  ...props
}: ArticleListSkeletonProps) => (
  <div data-slot="article-list-skeleton" className={cn('space-y-2', className)} {...props}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 py-2 px-3">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    ))}
  </div>
)

type QuestionCardSkeletonProps = React.ComponentProps<'div'>

const QuestionCardSkeleton = ({ className, ...props }: QuestionCardSkeletonProps) => (
  <div data-slot="question-card-skeleton" className={cn('space-y-4 rounded-lg border border-border p-5', className)} {...props}>
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <div className="space-y-2 mt-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  </div>
)

type ScoreRingSkeletonProps = Omit<React.ComponentProps<'div'>, 'children'> &
  VariantProps<typeof scoreRingSkeletonVariants>

const ScoreRingSkeleton = ({
  size = 'md',
  className,
  ...props
}: ScoreRingSkeletonProps) => (
  <Skeleton
    data-slot="score-ring-skeleton"
    className={cn(scoreRingSkeletonVariants({ size }), className)}
    {...props}
  />
)

export {
  Skeleton,
  CardSkeleton,
  TableRowSkeleton,
  StatCardSkeleton,
  ArticleListSkeleton,
  QuestionCardSkeleton,
  ScoreRingSkeleton,
}
