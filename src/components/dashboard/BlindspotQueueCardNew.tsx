import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
interface BlindspotItem {
  topicId: string
  topicName: string
  masteryWeight: number
  lastEncountered: string
}

interface BlindspotQueueCardProps {
  items: BlindspotItem[]
}

/**
 * DASHBOARD: BlindspotQueueCard
 * Renders a compact list of weak topics needing review.
 * Only rendered when items.length > 0 — parent handles conditional rendering.
 */
export function BlindspotQueueCardNew({ items }: BlindspotQueueCardProps) {
  if (items.length === 0) return null

  return (
    <div className="space-y-1.5">
      <p
        className="font-dm-mono text-[11px] font-medium uppercase tracking-[0.15em]"
        style={{ color: '#8896A7' }}
      >
        Focus Review
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const pct = Math.round(item.masteryWeight * 100)
          const pillBg = item.masteryWeight < 0.3 ? '#FEF8ED' : '#EEF2FC'
          const pillText = item.masteryWeight < 0.3 ? '#D4951A' : '#1B3FC4'

          return (
            <div
              key={item.topicId}
              className="flex items-center justify-between gap-2 py-0.5"
            >
              <span
                className="text-xs font-medium truncate"
                style={{ color: '#1A2332' }}
              >
                {item.topicName}
              </span>
              <span
                className="font-dm-mono shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-medium"
                style={{ backgroundColor: pillBg, color: pillText }}
              >
                {pct}%
              </span>
            </div>
          )
        })}
      </div>

      <Link
        href="/dashboard/testing?mode=camp"
        className="inline-block text-[11px] font-medium underline underline-offset-2 mt-0.5"
        style={{ color: '#1B3FC4' }}
      >
        Review all {items.length} topics
      </Link>
    </div>
  )
}

export function BlindspotQueueCardSkeleton() {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-3 w-24" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
      ))}
    </div>
  )
}
