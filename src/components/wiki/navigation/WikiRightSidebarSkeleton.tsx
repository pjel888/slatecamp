import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export const WikiRightSidebarSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Quiz Button Skeleton */}
      <Skeleton className="h-10 w-full rounded-md" />

      {/* Related Topics Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-24 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full rounded-sm" />
          <Skeleton className="h-8 w-full rounded-sm" />
          <Skeleton className="h-8 w-full rounded-sm" />
        </div>
      </div>

      {/* Feedback Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-20 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-sm" />
          <Skeleton className="h-8 w-8 rounded-sm" />
          <div className="w-px h-8 bg-border" />
          <Skeleton className="h-8 w-20 rounded-sm" />
        </div>
      </div>

      <Separator />

      {/* ToC Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-3 w-28 rounded" />
        <div className="space-y-3 pl-2">
          <Skeleton className="h-2.5 w-40 rounded" />
          <Skeleton className="h-2.5 w-32 rounded ml-4" />
          <Skeleton className="h-2.5 w-36 rounded ml-4" />
          <Skeleton className="h-2.5 w-28 rounded" />
          <Skeleton className="h-2.5 w-34 rounded ml-4" />
        </div>
      </div>
    </div>
  )
}
