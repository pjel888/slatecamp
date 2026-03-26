'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import { ChartCoachingAnnotation } from './ChartCoachingAnnotation'
import { MemoryStrengthQuadrant } from './MemoryStrengthQuadrant'
import type { MemoryStrengthOverview } from '@/lib/actions/analytics/get-memory-strength-data'

// ── Coaching Logic ───────────────────────────────────────────────────────────

const buildCoaching = (
  overview: MemoryStrengthOverview,
): { text: string; variant: 'insight' | 'warning' | 'success' } | null => {
  const { mastered, rusty, needsLearning, surfaceLearning, topics } = overview
  const total = topics.length

  if (total === 0) return null

  // Mostly mastered — celebrate
  if (mastered / total >= 0.6) {
    return {
      text: `${mastered} of ${total} topics are solidly encoded and accessible. Keep reviewing rusty topics to maintain coverage.`,
      variant: 'success',
    }
  }

  // Many rusty topics — knowledge is there but not accessible
  if (rusty > mastered && rusty >= 3) {
    return {
      text: `${rusty} topics are well-encoded but fading. A quick 5-question refresh session can restore retrieval strength.`,
      variant: 'insight',
    }
  }

  // Surface learning pattern — cramming detected
  if (surfaceLearning >= 3) {
    return {
      text: `${surfaceLearning} topics show surface learning — high retrieval but low storage. Try interleaved practice to build durable memory.`,
      variant: 'warning',
    }
  }

  // Many topics need learning
  if (needsLearning / total >= 0.5) {
    return {
      text: `${needsLearning} topics need deeper study. Start with the Wiki article, then reinforce with a Camp quiz.`,
      variant: 'insight',
    }
  }

  return null
}

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  data: MemoryStrengthOverview
}

export const MemoryStrengthCard = ({ data }: Props) => {
  const coaching = buildCoaching(data)
  const { mastered, rusty, needsLearning, surfaceLearning, topics } = data

  return (
    <Card className="border-border bg-white p-2 relative">
      <RichInfoPopover
        title="Memory Strength"
        description="Each dot is a topic plotted by storage strength (durable encoding) and retrieval strength (current accessibility). Topics in the bottom-right are well-learned but fading — a quick refresh restores them."
      />
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Memory Strength
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 px-1 pb-2">
        {/* Summary counts */}
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 px-2 mb-2">
            <SummaryPill color="#2D9F6F" label="Mastered" count={mastered} />
            <SummaryPill color="#1B3FC4" label="Rusty" count={rusty} />
            <SummaryPill color="#D4951A" label="Surface" count={surfaceLearning} />
            <SummaryPill color="#D64545" label="Needs learning" count={needsLearning} />
          </div>
        )}

        {/* Quadrant chart */}
        <MemoryStrengthQuadrant data={topics} />

        {/* Coaching annotation */}
        {coaching && (
          <ChartCoachingAnnotation text={coaching.text} variant={coaching.variant} />
        )}
      </CardContent>
    </Card>
  )
}

// ── Summary Pill ─────────────────────────────────────────────────────────────

const SummaryPill = ({
  color,
  label,
  count,
}: {
  color: string
  label: string
  count: number
}) => (
  <div className="flex items-center gap-1.5">
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-xs font-medium" style={{ color: '#1A2332' }}>
      {count}
    </span>
    <span className="text-xs" style={{ color: '#4A5568' }}>
      {label}
    </span>
  </div>
)
