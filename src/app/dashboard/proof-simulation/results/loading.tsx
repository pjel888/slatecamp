import { Skeleton, StatCardSkeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-24 mx-auto rounded-full" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>
  )
}
