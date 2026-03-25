import { cn } from '@/lib/utils'

// ─── SessionResultsSkeleton ──────────────────────────────────────────────────
// Pulse skeleton shown while session results data is loading.

const SessionResultsSkeleton = ({ className }: { className?: string }) => (
  <div
    className={cn('bg-card border border-border rounded-md p-6 animate-pulse space-y-6', className)}
    aria-busy="true"
    aria-label="Loading session results"
  >
    {/* Score number placeholder */}
    <div className="flex flex-col items-center gap-3">
      <div className="h-2 w-32 bg-muted rounded-sm" />
      <div className="h-12 w-24 bg-muted rounded-sm" />
      <div className="h-3 w-20 bg-muted rounded-sm" />
    </div>

    {/* Stats row placeholder */}
    <div className="flex justify-center gap-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="h-5 w-12 bg-muted rounded-sm" />
          <div className="h-2 w-16 bg-muted rounded-sm" />
        </div>
      ))}
    </div>

    {/* Topic breakdown placeholder */}
    <div className="space-y-3">
      <div className="h-2 w-28 bg-muted rounded-sm" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="h-2 w-32 bg-muted rounded-sm" />
          <div className="h-1.5 flex-1 bg-muted rounded-full" />
          <div className="h-2 w-10 bg-muted rounded-sm" />
        </div>
      ))}
    </div>

    {/* CTA placeholder */}
    <div className="h-10 w-full bg-muted rounded-sm" />
  </div>
)

export { SessionResultsSkeleton }
