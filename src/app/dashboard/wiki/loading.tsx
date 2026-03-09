import { Skeleton } from '@/components/ui/skeleton'

export default function WikiLoading() {
  return (
    <div className="max-w-[720px]">
      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-4 w-80 mb-6" />
      <Skeleton className="h-9 w-full mb-6" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
