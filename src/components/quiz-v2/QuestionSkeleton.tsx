'use client'

import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const SkeletonLine = ({ width, className }: { width: string; className?: string }) => {
  const reducedMotion = useReducedMotion()
  return (
    <div
      className={cn(
        'h-4 rounded-sm bg-border/50',
        !reducedMotion && 'animate-pulse',
        className,
      )}
      style={{ width }}
    />
  )
}

const SkeletonOption = () => {
  const reducedMotion = useReducedMotion()
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border border-border/30 px-4 py-3 min-h-[52px]',
        !reducedMotion && 'animate-pulse',
      )}
    >
      <div className="w-6 h-6 rounded-sm bg-border/40 shrink-0" />
      <div className="flex-1 h-4 rounded-sm bg-border/40" />
    </div>
  )
}

export const QuestionSkeleton = () => {
  const reducedMotion = useReducedMotion()
  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto" aria-label="Loading question" role="status">
      {/* Question stem skeleton */}
      <div className="space-y-3">
        <SkeletonLine width="100%" className="h-5" />
        <SkeletonLine width="80%" />
        <SkeletonLine width="60%" />
      </div>

      {/* Answer options skeleton */}
      <div className="space-y-3">
        <SkeletonOption />
        <SkeletonOption />
        <SkeletonOption />
        <SkeletonOption />
      </div>

      {/* Slide-to-submit skeleton */}
      <div className={cn('h-[52px] rounded-md bg-border/30', !reducedMotion && 'animate-pulse')} />
    </div>
  )
}
