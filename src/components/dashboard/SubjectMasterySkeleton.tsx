'use client'

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const SubjectMasterySkeleton = () => {
  return (
    <div className='grid grid-rows-3 bg-card rounded-md overflow-hidden h-full p-2 gap-2 animate-pulse'>
      {/* ── Radial heatmap section ──────────────────────────────────── */}
      <div className='rounded-md bg-muted border border-border-design p-3 flex flex-col items-center justify-center min-h-0'>
        <div className="w-full">
          <Skeleton className='h-3 w-32 mb-1.5 bg-muted' />
          <Skeleton className='h-2.5 w-48 mb-4 bg-muted' />
        </div>
        <Skeleton className='h-[140px] w-[140px] rounded-full bg-muted' />
      </div>

      {/* ── Subject breakdown bars ──────────────────────────────────── */}
      <div className='row-span-2 rounded-md bg-muted border border-border-design p-3 flex flex-col min-h-0'>
        <Skeleton className='h-3 w-24 mb-1.5 bg-muted' />
        <Skeleton className='h-2.5 w-40 mb-4 bg-muted' />
        
        <div className='space-y-4 flex-1'>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className='h-3 w-32 bg-muted' />
                <Skeleton className='h-3 w-8 bg-muted' />
              </div>
              <Skeleton className='h-1.5 w-full bg-muted rounded-full' />
              <Skeleton className='h-2 w-16 bg-muted' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
