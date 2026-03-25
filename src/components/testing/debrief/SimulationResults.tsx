'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CaretLeft } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { DebriefLayout } from './DebriefLayout'
import { PressureGapCard } from './PressureGapCard'
import { getScoreBand } from '@/types/testing'
import type { ModeSource, PressureGap } from '@/types/testing'

// ─── Raw DB shapes (mirrors what SimulationResultsPage passes) ────────────────

interface RawQuestion {
  question_id: string
  text: string
  options: Array<{ id: string; text: string; letter?: string }>
  correct_option_id: string
  rationale: string | null
  code_citation: string | null
  model_id: string | null
  topic_id: string
}

interface RawInteraction {
  interaction_id: string
  question_order: number
  selected_option_id: string | null
  is_correct: boolean
  confidence_tag: 'sure' | 'unsure' | null
  error_tags: string[] | null
  eliminated_option_ids: string[] | null
  is_flagged: boolean
  time_spent_ms: number
  questions: RawQuestion
}

interface RawSession {
  session_id: string
  status: string
  config: {
    source?: ModeSource
    preSessionConfidence?: Array<{ subjectId: string; subjectName: string; rating: 1 | 2 | 3 }>
    isEnduranceSession?: boolean
  } | null
  question_ids: string[] | null
  completed_at: string | null
  mastery_snapshot_at_start?: Record<string, number> | null
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SimulationResultsProps {
  session: RawSession
  resultsAvailable: boolean
  hoursRemaining: number
  completedAt: string | null
  interactions: RawInteraction[] | null
  readinessScore: number
}

// ─── Waiting state ────────────────────────────────────────────────────────────

const WaitingState = ({
  hoursRemaining,
  completedAt,
  onBack,
}: {
  hoursRemaining: number
  completedAt: string | null
  onBack: () => void
}) => {
  const formattedDate = completedAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(completedAt))
    : null

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="bg-card rounded-lg border border-border p-8">
          {/* Clock icon */}
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--slate-blue-50)' }}
            aria-hidden="true"
          >
            <Clock
              className="h-6 w-6"
              style={{ color: 'var(--primary)' }}
            />
          </div>

          {/* Heading */}
          <h1
            className="mt-5 text-lg font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            Your results are being prepared
          </h1>

          {/* Hours remaining */}
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Available in approximately{' '}
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>
              {hoursRemaining} hour{hoursRemaining !== 1 ? 's' : ''}
            </span>
          </p>

          {/* Completed at */}
          {formattedDate && (
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Completed {formattedDate}
            </p>
          )}

          {/* Notification note */}
          <p
            className="mt-4 text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            We&apos;ll notify you when your results are ready.
          </p>

          {/* Back button */}
          <div className="mt-6">
            <Button
              variant="outline"
              size="md"
              onClick={onBack}
              leftIcon={<CaretLeft size={16} />}
            >
              Back to Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SimulationResults = ({
  session,
  resultsAvailable,
  hoursRemaining,
  completedAt,
  interactions,
  readinessScore,
}: SimulationResultsProps) => {
  const router = useRouter()

  const handleBack = useCallback(() => {
    router.push('/dashboard/testing')
  }, [router])

  // Waiting state
  if (!resultsAvailable || !interactions) {
    return (
      <WaitingState
        hoursRemaining={hoursRemaining}
        completedAt={completedAt}
        onBack={handleBack}
      />
    )
  }

  // Compute simulation score for pressure gap
  const correctCount = interactions.filter(i => i.is_correct).length
  const simulationScore = interactions.length > 0
    ? Math.round((correctCount / interactions.length) * 100)
    : 0

  const gap = readinessScore - simulationScore
  let interpretation: string
  if (gap > 10) {
    interpretation =
      'A significant gap between your practice score and simulation performance — this is common. Exam pressure affects recall differently than practice sessions. More simulation reps will help close this gap.'
  } else if (gap >= 5) {
    interpretation =
      'A moderate pressure gap — your knowledge is solid but exam conditions affect your performance slightly. This is normal and improves with practice.'
  } else if (gap > 0) {
    interpretation =
      'A small gap that is well within normal range. Your simulation score closely tracks your Readiness Score — a strong sign.'
  } else if (gap === 0) {
    interpretation =
      'Perfect alignment between your Readiness Score and simulation performance. You performed exactly as expected under pressure.'
  } else {
    interpretation =
      'You outperformed your Readiness Score under exam conditions — an excellent result. Your knowledge is consolidating well.'
  }

  const pressureGap: PressureGap = {
    readinessScore,
    simulationScore,
    gap,
    interpretation,
  }

  return (
    <main
      className="max-w-[720px] mx-auto px-6 py-8"
      aria-label="Simulation results"
    >
      <div className="space-y-8">
        {/* Pressure gap at top */}
        <div
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: '0ms', animationFillMode: 'both' }}
        >
          <PressureGapCard pressureGap={pressureGap} />
        </div>

        {/* Full debrief layout (below pressure gap) */}
        <DebriefLayout
          session={session}
          interactions={interactions}
          readinessBefore={readinessScore}
          readinessAfter={simulationScore}
          masteryData={[]}
          masterySnapshotAtStart={null}
        />
      </div>
    </main>
  )
}
