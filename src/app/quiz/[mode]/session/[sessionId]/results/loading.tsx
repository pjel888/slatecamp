const ShimmerBlock = ({ className }: { className?: string }) => (
  <div className={`rounded-md bg-[#D4DAE3]/50 animate-pulse ${className ?? ''}`} />
)

const Loading = () => (
  <div
    className="flex flex-col items-center gap-6 p-6 max-w-2xl mx-auto pt-16 animate-in fade-in-0 duration-150"
    role="status"
    aria-busy="true"
    aria-label="Loading results"
  >
    {/* Score circle skeleton */}
    <ShimmerBlock className="h-24 w-24 rounded-full" />
    {/* Score text */}
    <ShimmerBlock className="h-8 w-32" />
    {/* Subtitle */}
    <ShimmerBlock className="h-4 w-48" />
    {/* Breakdown cards */}
    <div className="w-full space-y-3 mt-4">
      <ShimmerBlock className="h-12 w-full" />
      <ShimmerBlock className="h-12 w-full" />
      <ShimmerBlock className="h-12 w-full" />
    </div>
  </div>
)

export default Loading
