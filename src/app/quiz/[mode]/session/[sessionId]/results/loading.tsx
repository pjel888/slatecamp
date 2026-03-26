import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => (
  <div className="flex flex-col items-center gap-6 p-6 max-w-2xl mx-auto pt-16">
    <Skeleton className="h-24 w-24 rounded-full" />
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-4 w-48" />
    <div className="w-full space-y-3 mt-4">
      <Skeleton className="h-12 w-full rounded-md" />
      <Skeleton className="h-12 w-full rounded-md" />
      <Skeleton className="h-12 w-full rounded-md" />
    </div>
  </div>
)

export default Loading
