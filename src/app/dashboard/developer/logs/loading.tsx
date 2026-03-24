import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-2">
        <div className="flex items-center gap-3 py-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
        <div className="flex items-center gap-3 py-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
        <div className="flex items-center gap-3 py-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
        <div className="flex items-center gap-3 py-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
        <div className="flex items-center gap-3 py-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
        <div className="flex items-center gap-3 py-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
        <div className="flex items-center gap-3 py-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
        <div className="flex items-center gap-3 py-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
      </div>
    </div>
  )
}
