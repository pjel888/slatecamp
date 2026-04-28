import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => (
  <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto">
    <div className="flex gap-2 mb-2">
      <Skeleton className="h-8 w-16 rounded-full" />
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="border border-border rounded-md p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full rounded-sm" />
      </div>
    ))}
  </div>
)

export default Loading
