import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => (
  <div className="space-y-6 max-w-[1200px]">
    {/* Header */}
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>

    {/* Monthly P&L chart */}
    <Skeleton className="h-56" />

    {/* Expense breakdown + cost summary */}
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>

    {/* Ledger */}
    <Skeleton className="h-48" />

    {/* Runway */}
    <Skeleton className="h-28" />
  </div>
)

export default Loading
