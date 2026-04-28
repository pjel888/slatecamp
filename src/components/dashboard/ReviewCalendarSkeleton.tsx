'use client'

import { Skeleton } from "@/components/ui/skeleton"

export const ReviewCalendarSkeleton = () => {
  return (
    <div className="rounded-md border border-border bg-card p-2 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 bg-muted" />
          <Skeleton className="h-3.5 w-24 bg-muted" />
        </div>
        <Skeleton className="h-3 w-32 bg-muted" />
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-7 gap-1">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-1 rounded-md border border-border bg-card p-1.5 min-w-0"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-2.5 w-8 bg-muted" />
            </div>
            <div className="flex flex-col gap-0.5 mt-1">
              <Skeleton className="h-4 w-full bg-muted rounded-sm" />
              <Skeleton className="h-4 w-3/4 bg-muted rounded-sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border">
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-3 bg-muted rounded-full" />
          <Skeleton className="h-2.5 w-48 bg-muted" />
        </div>
        <Skeleton className="h-3 w-16 bg-muted" />
      </div>
    </div>
  )
}
