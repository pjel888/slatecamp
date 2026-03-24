const Loading = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[#F8F7F5]">
      {/* Content bar skeleton */}
      <div className="flex shrink-0 items-center gap-4 border-b border-[#D4DAE3] bg-white px-4 py-3">
        <div className="h-4 w-20 animate-pulse rounded bg-[#D4DAE3]" />
        <div className="h-4 w-px bg-[#D4DAE3]" />
        <div className="h-4 w-48 animate-pulse rounded bg-[#D4DAE3]" />
        <div className="flex-1" />
        <div className="h-4 w-16 animate-pulse rounded bg-[#D4DAE3]" />
        <div className="h-8 w-24 animate-pulse rounded-sm bg-[#D4DAE3]" />
      </div>

      {/* Three-column skeleton */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Outline */}
        <div className="w-[200px] shrink-0 border-r border-[#D4DAE3] bg-white p-4">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-3 animate-pulse rounded bg-[#D4DAE3]"
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            ))}
          </div>
        </div>

        {/* Article panel */}
        <div className="flex w-[55%] flex-col border-r border-[#D4DAE3]">
          <div className="shrink-0 border-b border-[#D4DAE3] bg-[#F8F7F5] px-4 py-2">
            <div className="flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded bg-[#D4DAE3]" />
              <div className="h-6 w-16 animate-pulse rounded bg-[#D4DAE3]" />
              <div className="h-6 w-12 animate-pulse rounded bg-[#D4DAE3]" />
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="space-y-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 animate-pulse rounded bg-[#D4DAE3]"
                  style={{ width: `${40 + Math.random() * 60}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Questions panel */}
        <div className="flex w-[45%] flex-col">
          <div className="shrink-0 border-b border-[#D4DAE3] bg-[#F8F7F5] px-4 py-2">
            <div className="flex gap-2">
              <div className="h-6 w-20 animate-pulse rounded bg-[#D4DAE3]" />
              <div className="h-6 w-20 animate-pulse rounded bg-[#D4DAE3]" />
            </div>
          </div>
          <div className="flex-1 space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-md border border-[#D4DAE3] bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loading
