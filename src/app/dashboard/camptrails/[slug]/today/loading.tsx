import { Skeleton } from '@/components/ui/skeleton'

export default function TrailTodayLoading() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 animate-in fade-in-0 duration-150">
      <Skeleton className="h-4 w-24" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="h-px bg-[border]" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-md border border-[border] bg-white p-4 space-y-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-9 w-32 rounded-sm" />
        </div>
      ))}
      <div className="h-px bg-[border]" />
      <Skeleton className="h-16 w-full rounded-md" />
    </div>
  )
}
