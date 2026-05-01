import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => (
  <div className="flex h-full min-h-0 flex-col">
    <div className="h-14 border-b border-border flex items-center px-4 gap-3">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-2 flex-1 rounded-full" />
      <Skeleton className="h-5 w-16" />
    </div>
    <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-5xl mx-auto w-full">
      <div className="flex-1 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex-1 space-y-3">
        <Skeleton className="h-14 w-full rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
      </div>
    </div>
  </div>
)

export default Loading
