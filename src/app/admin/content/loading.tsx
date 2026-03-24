export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-[#D4DAE3]" />
          <div className="h-3 w-72 animate-pulse rounded bg-[#D4DAE3]" />
        </div>
        <div className="h-8 w-28 animate-pulse rounded-sm bg-[#D4DAE3]" />
      </div>

      {/* Article list skeleton */}
      <div className="grid gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-md border border-[#D4DAE3] bg-white px-4 py-3"
          >
            <div className="flex-1 space-y-1.5">
              <div
                className="h-4 animate-pulse rounded bg-[#D4DAE3]"
                style={{ width: `${30 + Math.random() * 50}%` }}
              />
              <div className="h-3 w-48 animate-pulse rounded bg-[#D4DAE3]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
