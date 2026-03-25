import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/ui/eyebrow'

interface NeedsAttentionCardProps {
  pendingReviews: number
  missingRationale: number
}

const NeedsAttentionCard = ({ pendingReviews, missingRationale }: NeedsAttentionCardProps) => {
  const hasItems = pendingReviews > 0 || missingRationale > 0

  return (
    <Card size="md" variant="accent-left" className="border-l-amber-400">
      <div className="flex items-center justify-between mb-3">
        <Eyebrow>Needs Attention</Eyebrow>
      </div>

      {!hasItems ? (
        <p className="text-sm text-muted-foreground">All clear — nothing needs immediate attention.</p>
      ) : (
        <div className="space-y-2">
          {pendingReviews > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs select-none">●</span>
              <span className="font-[family-name:var(--font-dm-mono)] text-xs tabular-nums font-medium text-foreground">
                {pendingReviews}
              </span>
              <span className="text-xs text-muted-foreground flex-1">articles pending review</span>
              <Link
                href="/admin/reviews"
                className="inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-700 hover:text-amber-900 transition-colors duration-150 shrink-0"
              >
                View
                <ArrowRight size={10} />
              </Link>
            </div>
          )}
          {missingRationale > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs select-none">●</span>
              <span className="font-[family-name:var(--font-dm-mono)] text-xs tabular-nums font-medium text-foreground">
                {missingRationale}
              </span>
              <span className="text-xs text-muted-foreground flex-1">questions missing rationale</span>
              <Link
                href="/admin/questions?filter=missing_rationale"
                className="inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-700 hover:text-amber-900 transition-colors duration-150 shrink-0"
              >
                View
                <ArrowRight size={10} />
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export { NeedsAttentionCard }
