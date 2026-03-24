import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-sm bg-muted', className)}
      {...props}
    />
  )
}

const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('rounded-lg border border-border p-4 space-y-3', className)}>
    <Skeleton className="h-3 w-20" />
    <Skeleton className="h-5 w-48" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
)

const TableRowSkeleton = ({ columns = 4 }: { columns?: number }) => (
  <div className="flex items-center gap-4 py-3 px-4 border-b border-border">
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} className={cn('h-4', i === 0 ? 'w-48' : 'w-24')} />
    ))}
  </div>
)

const StatCardSkeleton = () => (
  <div className="rounded-lg border border-border p-4 space-y-2">
    <Skeleton className="h-2.5 w-16" />
    <Skeleton className="h-8 w-20" />
    <Skeleton className="h-3 w-24" />
  </div>
)

const ArticleListSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 py-2 px-3">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    ))}
  </div>
)

const QuestionCardSkeleton = () => (
  <div className="rounded-lg border border-border p-5 space-y-4">
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <div className="space-y-2 mt-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  </div>
)

const ScoreRingSkeleton = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizeMap = { sm: 'w-10 h-10', md: 'w-16 h-16', lg: 'w-24 h-24', xl: 'w-32 h-32' }
  return <Skeleton className={cn('rounded-full', sizeMap[size])} />
}

export {
  Skeleton,
  CardSkeleton,
  TableRowSkeleton,
  StatCardSkeleton,
  ArticleListSkeleton,
  QuestionCardSkeleton,
  ScoreRingSkeleton,
}
