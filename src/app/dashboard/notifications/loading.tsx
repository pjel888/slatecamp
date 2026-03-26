import { Skeleton } from '@/components/ui/skeleton'

const NotificationsLoading = () => {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-sm" />
          <Skeleton className="h-8 w-20 rounded-sm" />
        </div>
      </div>
      <div className="flex gap-1.5 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-3 w-12 mb-3" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3.5 px-4 py-3.5 mb-px">
          <Skeleton className="w-9 h-9 rounded-[10px] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationsLoading
