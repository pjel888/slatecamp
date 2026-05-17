'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getScoreColor } from '@/components/shared/score-display'
import type { TopicIntelligenceCard } from '@/lib/actions/analytics/get-topic-intelligence-data'
import { cn } from '@/lib/utils'

interface Props {
  data: TopicIntelligenceCard[]
  heightClassName?: string
  variant?: 'default' | 'compact'
}

const RECOMMENDATION_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  'review': { label: 'Review', variant: 'secondary' },
  'practice': { label: 'Practice', variant: 'default' },
  'read-wiki': { label: 'Read Wiki', variant: 'outline' },
}

const ERROR_LABELS: Record<string, string> = {
  concept_confusion: 'Concept confusion',
  knowledge_gap: 'Knowledge gap',
  careless_error: 'Careless error',
  procedural_error: 'Procedural error',
}

const MasteryBar = ({ pct }: { pct: number }) => {
  return (
    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden" role="presentation">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-200 ease-out',
          getScoreColor(pct).bg,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

const formatDate = (iso: string | null): string => {
  if (!iso) return 'Never'
  const d = new Date(iso)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

export const TopicIntelligenceCards = ({
  data,
  heightClassName = 'h-[400px]',
  variant = 'default',
}: Props) => {
  const isCompact = variant === 'compact'

  return (
    <div
      className={cn(
        'grid min-h-0 grid-cols-1 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3',
        isCompact ? 'gap-2' : 'gap-3',
        heightClassName,
      )}
      role="list"
      aria-label="Topic intelligence cards for weakest topics"
    >
      {data.map((card, index) => {
        const rec = RECOMMENDATION_LABELS[card.recommendation] ?? {
          label: card.recommendation,
          variant: 'outline' as const,
        }
        return (
          <Card
            key={`${card.topicId}-${card.recommendation}-${index}`}
            className={cn(
              'border-border bg-card flex flex-col',
              isCompact ? 'gap-1.5 p-2' : 'gap-2 p-3',
            )}
            role="listitem"
          >
            <CardContent className={cn('p-0 flex flex-col', isCompact ? 'gap-1.5' : 'gap-2')}>
              <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                {card.topicName}
              </p>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Mastery</span>
                  <span className="text-[11px] font-mono tabular-nums text-foreground">
                    {card.masteryPct}%
                  </span>
                </div>
                <MasteryBar pct={card.masteryPct} />
              </div>

              {card.errorType && (
                <p className="text-[11px] text-muted-foreground">
                  Top error:{' '}
                  <span className="text-foreground">
                    {ERROR_LABELS[card.errorType] ?? card.errorType}
                  </span>
                </p>
              )}

              <div className="flex items-center justify-between mt-auto pt-1">
                <span className="text-[11px] text-muted-foreground">
                  Last seen {formatDate(card.lastEncountered)}
                </span>
                <Badge variant={rec.variant} className="text-[10px] h-5 px-1.5">
                  {rec.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
