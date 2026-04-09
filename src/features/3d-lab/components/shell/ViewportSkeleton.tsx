'use client'

// ViewportSkeleton — skeleton loading state for 3D scene initialization
// Shown before the R3F canvas has rendered its first frame.

export const ViewportSkeleton = () => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
      {/* Subtle animated skeleton */}
      <div className="flex flex-col items-center gap-3">
        {/* Simulated viewport area */}
        <div className="h-48 w-64 animate-pulse rounded-md bg-muted" />
        <div className="flex gap-2">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
        <p className="text-xs text-muted-foreground">Loading 3D scene...</p>
      </div>
    </div>
  )
}
