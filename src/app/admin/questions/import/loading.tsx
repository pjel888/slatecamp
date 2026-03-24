import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-8 w-48" />
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-12">
        <div className="space-y-3 text-center">
          <Skeleton className="h-12 w-12 mx-auto rounded-full" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    </div>
  )
}
