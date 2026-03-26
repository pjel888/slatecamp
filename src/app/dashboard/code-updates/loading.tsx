import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => (
  <div className="flex flex-col gap-3 p-2">
    <Skeleton className="h-7 w-48" />
    <Skeleton className="h-4 w-72" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
      <Skeleton className="h-32 rounded-md" />
      <Skeleton className="h-32 rounded-md" />
      <Skeleton className="h-32 rounded-md" />
      <Skeleton className="h-32 rounded-md" />
    </div>
  </div>
)

export default Loading
