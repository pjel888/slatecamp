'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import type { ErrorPatternData } from '@/lib/actions/analytics/get-error-patterns'
import type { ErrorCategory } from '@/lib/quiz/error-classifier'

// ─── Color map (Campfire palette) ─────────────────────────────────────────────

const CATEGORY_COLORS: Record<ErrorCategory, string> = {
  random_guess: '#D4DAE3',       // Border Default (light gray)
  knowledge_gap: '#D4951A',      // Amber
  misremembered_fact: '#1B3FC4', // Camp Cobalt
  concept_confusion: '#D64545',  // Warm Red
  computation_error: '#3B82C8',  // Info Blue
  misread_question: '#8896A7',   // Ink Tertiary
}

const CATEGORY_LABELS: Record<ErrorCategory, string> = {
  random_guess: 'Quick answer',
  knowledge_gap: 'New territory',
  misremembered_fact: 'Detail mix-up',
  concept_confusion: 'Concept confusion',
  computation_error: 'Process error',
  misread_question: 'Misread',
}

interface Props {
  data: ErrorPatternData
}

export const ErrorPatternCard = ({ data }: Props) => {
  const { categoryCounts, totalClassified, conceptConfusionTopics } = data

  if (totalClassified === 0) {
    return (
      <Card className="border-border bg-white p-2 relative h-full">
        <RichInfoPopover
          title="Error Patterns"
          description="Shows the distribution of error types across your recent incorrect answers to help target your review."
        />
        <CardHeader className="p-2 pt-1">
          <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Error Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="h-[120px] flex items-center justify-center">
            <p className="text-xs text-center leading-snug max-w-[200px] text-[#4A5568]">
              Complete a few practice sessions to see your error pattern breakdown.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-white p-2 relative h-full">
      <RichInfoPopover
        title="Error Patterns"
        description="Shows the distribution of error types across your recent incorrect answers to help target your review."
      />
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Error Patterns
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0 space-y-3">
        {/* Stacked horizontal bar */}
        <div className="space-y-1.5">
          <div className="flex h-3 w-full rounded-sm overflow-hidden">
            {categoryCounts.map(({ category, count }) => {
              const pct = (count / totalClassified) * 100
              if (pct < 1) return null
              return (
                <div
                  key={category}
                  className="h-full transition-all duration-150"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: CATEGORY_COLORS[category] ?? '#D4DAE3',
                  }}
                  title={`${CATEGORY_LABELS[category] ?? category}: ${Math.round(pct)}%`}
                />
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {categoryCounts.map(({ category, count }) => {
              const pct = Math.round((count / totalClassified) * 100)
              if (pct < 1) return null
              return (
                <div key={category} className="flex items-center gap-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[category] ?? '#D4DAE3' }}
                  />
                  <span className="text-[10px] text-[#4A5568]">
                    {CATEGORY_LABELS[category] ?? category} {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Frequently confused topics */}
        {conceptConfusionTopics.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8896A7]">
              Topics that need attention
            </p>
            <ul className="space-y-0.5">
              {conceptConfusionTopics.map((topic) => (
                <li
                  key={topic.topicId}
                  className="flex items-center justify-between text-xs text-[#4A5568]"
                >
                  <span className="truncate mr-2">{topic.topicName}</span>
                  <span className="shrink-0 text-[10px] text-[#8896A7]">
                    {topic.errorCount} {topic.errorCount === 1 ? 'time' : 'times'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
