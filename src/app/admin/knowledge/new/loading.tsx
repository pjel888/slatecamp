const Loading = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-surface-light">
      {/* Content bar skeleton */}
      <div className="flex shrink-0 items-center gap-4 border-b border-border bg-card px-4 py-3">
        <div className="h-4 w-20 animate-pulse rounded bg-border" />
        <div className="h-4 w-px bg-border" />
        <div className="h-4 w-48 animate-pulse rounded bg-border" />
        <div className="flex-1" />
        <div className="h-4 w-16 animate-pulse rounded bg-border" />
        <div className="h-8 w-24 animate-pulse rounded-sm bg-border" />
      </div>

      {/* Three-column skeleton */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Outline */}
        <div className="w-[200px] shrink-0 bg-muted/40 p-4">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-3 animate-pulse rounded bg-border"
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            ))}
          </div>
        </div>

        {/* Article panel */}
        <div className="flex w-[55%] flex-col">
          <div className="shrink-0 border-b border-border bg-surface-light px-4 py-2">
            <div className="flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded bg-border" />
              <div className="h-6 w-16 animate-pulse rounded bg-border" />
              <div className="h-6 w-12 animate-pulse rounded bg-border" />
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="space-y-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 animate-pulse rounded bg-border"
                  style={{ width: `${40 + Math.random() * 60}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Questions panel */}
        <div className="flex w-[45%] flex-col">
          <div className="shrink-0 border-b border-border bg-surface-light px-4 py-2">
            <div className="flex gap-2">
              <div className="h-6 w-20 animate-pulse rounded bg-border" />
              <div className="h-6 w-20 animate-pulse rounded bg-border" />
            </div>
          </div>
          <div className="flex-1 space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-md border border-border bg-card"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loading
