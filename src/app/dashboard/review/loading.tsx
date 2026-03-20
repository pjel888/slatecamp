import { Skeleton } from '@/components/ui/skeleton'

export default function TestingLoading() {
  return (
    <div className="w-full h-full bg-[#F8F7F5] animate-in fade-in-0 duration-150">
      <div className="flex flex-col h-full">
        {/* Top bar */}
        <div className="shrink-0 border-b border-[#D4DAE3] bg-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-sm" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-sm" />
            <Skeleton className="h-8 w-28 rounded-sm" />
          </div>
        </div>

        {/* Mode selector + config area */}
        <div className="shrink-0 bg-white border-b border-[#D4DAE3] px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            {['Camp', 'Storm', 'Chill', 'Focus Review'].map((label) => (
              <Skeleton key={label} className="h-9 w-20 rounded-sm" />
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-48 rounded-sm" />
            <Skeleton className="h-9 w-36 rounded-sm" />
            <Skeleton className="h-9 w-32 rounded-sm" />
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg space-y-6 text-center">
            {/* Mode icon */}
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            {/* Title + description */}
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-72 mx-auto" />
            {/* Stats row */}
            <div className="flex justify-center gap-6 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-1.5">
                  <Skeleton className="h-6 w-10 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
            {/* Start button */}
            <Skeleton className="h-11 w-52 rounded-sm mx-auto mt-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
