import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4 p-6 text-center">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-24 w-24 mx-auto rounded-full" />
        <Skeleton className="h-6 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  )
}
