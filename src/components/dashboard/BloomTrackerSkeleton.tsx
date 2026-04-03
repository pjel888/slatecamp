'use client'

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const BloomTrackerSkeleton = () => {
  return (
    <div className="rounded-md bg-white p-3 flex flex-col animate-pulse">
      {/* Header */}
      <Skeleton className="h-3 w-32 mb-1.5 bg-gray-200 dark:bg-gray-800" />
      <Skeleton className="h-2.5 w-48 mb-4 bg-gray-200 dark:bg-gray-800" />

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-5 w-16 rounded-sm bg-gray-200 dark:bg-gray-800" />
        ))}
      </div>

      {/* Bars */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20 bg-gray-200 dark:bg-gray-800" />
              <div className="flex gap-2">
                <Skeleton className="h-3 w-8 bg-gray-200 dark:bg-gray-800" />
                <Skeleton className="h-3 w-16 bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
            <Skeleton className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  )
}
