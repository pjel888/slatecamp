import { cn } from '@/lib/utils'

interface SectionHeaderSkeletonProps {
  hasEyebrow?: boolean
  hasSubtitle?: boolean
  hasAction?: boolean
  className?: string
}

export const SectionHeaderSkeleton = ({
  hasEyebrow = false,
  hasSubtitle = false,
  hasAction = false,
  className,
}: SectionHeaderSkeletonProps) => (
  <div
    className={cn('flex items-start justify-between', className)}
    aria-busy="true"
    aria-label="Loading section header"
  >
    <div className="flex flex-col gap-1.5">
      {hasEyebrow && (
        <div className="bg-muted animate-pulse rounded-sm h-2 w-16" />
      )}
      {/* title */}
      <div className="bg-muted animate-pulse rounded-sm h-5 w-40" />
      {hasSubtitle && (
        <div className="bg-muted animate-pulse rounded-sm h-3.5 w-56" />
      )}
    </div>
    {hasAction && (
      <div className="bg-muted animate-pulse rounded-sm h-4 w-16 shrink-0" />
    )}
  </div>
)

export type { SectionHeaderSkeletonProps }
