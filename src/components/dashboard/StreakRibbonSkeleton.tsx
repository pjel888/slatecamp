'use client'

import { cn } from "@/lib/utils"

export const StreakRibbonSkeleton = () => {
  return (
    <div className="flex items-center gap-2 animate-pulse">
      <div className="flex items-center gap-1">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-muted"
          />
        ))}
      </div>
      <div className="h-3 w-24 bg-muted rounded-md" />
    </div>
  )
}
