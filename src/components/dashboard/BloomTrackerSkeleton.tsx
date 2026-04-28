'use client'

import { Skeleton } from "@/components/ui/skeleton"

export const BloomTrackerSkeleton = () => {
  return (
    <div className="rounded-md bg-card p-3 flex flex-col animate-pulse">
      {/* Header */}
      <Skeleton className="h-3 w-32 mb-1.5 bg-muted" />
      <Skeleton className="h-2.5 w-48 mb-4 bg-muted" />

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-5 w-16 rounded-sm bg-muted" />
        ))}
      </div>

      {/* Bars */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20 bg-muted" />
              <div className="flex gap-2">
                <Skeleton className="h-3 w-8 bg-muted" />
                <Skeleton className="h-3 w-16 bg-muted" />
              </div>
            </div>
            <Skeleton className="h-2 w-full bg-muted rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  )
}
