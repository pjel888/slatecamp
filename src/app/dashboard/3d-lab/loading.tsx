import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
  )
}
