import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[var(--surface-focused)] flex flex-col">
      <Skeleton className="h-1 w-full" />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <Skeleton className="h-6 w-32 mb-8" />
        <Skeleton className="h-5 w-full max-w-lg mb-4" />
        <Skeleton className="h-4 w-full max-w-md mb-8" />
        <div className="space-y-3 w-full max-w-lg">
          <Skeleton className="h-14 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}
