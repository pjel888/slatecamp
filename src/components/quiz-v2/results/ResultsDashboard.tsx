import { Suspense } from 'react'
import { ScoreReveal } from './ScoreReveal'
import { SubjectBreakdown } from './SubjectBreakdown'
import { ReadinessImpact } from './ReadinessImpact'
import { StaminaChart } from './StaminaChart'
import { ReviewCardList } from './ReviewCardList'
import { ResultsCTAs } from './ResultsCTAs'
import type {
  EndSessionResult,
  QuizSessionConfig,
  StaminaBlock,
  ReviewQuestionData,
  QuestionHistoryStats,
} from '@/types/quiz-config'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResultsDashboardProps {
  sessionId: string
  result: EndSessionResult
  config: QuizSessionConfig
  staminaBlocks?: StaminaBlock[]
  reviewQuestions: ReviewQuestionData[]
  questionHistory?: Record<string, QuestionHistoryStats>
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

const ScoreSkeleton = () => (
  <div className="bg-white rounded-md border border-[#D4DAE3] p-8 text-center animate-pulse">
    <div className="h-3 w-28 bg-[#F8F7F5] rounded mx-auto" />
    <div className="h-16 w-32 bg-[#F8F7F5] rounded mx-auto mt-4" />
    <div className="h-4 w-20 bg-[#F8F7F5] rounded mx-auto mt-3" />
  </div>
)

const ChartSkeleton = () => (
  <div className="bg-white rounded-md border border-[#D4DAE3] p-4 h-40 animate-pulse" />
)

const ReviewSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-md border border-[#D4DAE3] h-14" />
    ))}
  </div>
)

// ─── Merged CTAs (updated for inline review) ─────────────────────────────────

const MergedCTAs = ({
  sessionId,
  missedCount,
  isPerfect,
}: {
  sessionId: string
  missedCount: number
  isPerfect: boolean
}) => {
  if (isPerfect) {
    return (
      <div className="text-center">
        <p className="text-base font-semibold text-[#2D9F6F] mb-4">
          Perfect session. Every question correct.
        </p>
        <ResultsCTAs sessionId={sessionId} missedCount={0} />
      </div>
    )
  }

  return <ResultsCTAs sessionId={sessionId} missedCount={missedCount} />
}

// ─── Component ────────────────────────────────────────────────────────────────

// This is a Server Component — no 'use client' directive.
// Client islands (ScoreReveal, StaminaChart, ReviewCardList, ResultsCTAs) are wrapped in Suspense.

const ResultsDashboard = ({
  sessionId,
  result,
  config,
  staminaBlocks,
  reviewQuestions,
  questionHistory,
}: ResultsDashboardProps) => {
  const showStamina =
    config.results.showStaminaChart &&
    staminaBlocks !== undefined &&
    staminaBlocks.length >= 2

  const missedCount = reviewQuestions.filter((q) => !q.isCorrect && !q.isSkipped).length
  const isPerfect = result.score.correct === result.score.total && result.score.total > 0

  return (
    <main
      className="max-w-[900px] mx-auto px-4 py-8 space-y-8"
      aria-label="Session results"
    >
      {/* ── Section 1: Score Hero ──────────────────────────────────────────── */}
      <section aria-label="Score summary">
        <Suspense fallback={<ScoreSkeleton />}>
          <ScoreReveal
            percent={result.score.percent}
            correct={result.score.correct}
            total={result.score.total}
            growthDelta={config.results.showGrowthDelta ? result.growthVsPrevious : null}
          />
        </Suspense>

        {/* Readiness impact — hidden in Chill mode */}
        {config.results.showReadinessScoreImpact && (
          <div className="mt-4">
            <ReadinessImpact
              before={result.readinessScoreBefore}
              after={result.readinessScoreAfter}
              delta={result.readinessScoreDelta}
            />
          </div>
        )}
      </section>

      {/* ── Section 2: Performance Breakdown ───────────────────────────────── */}
      <section aria-label="Performance breakdown">
        {/* Subject breakdown — conditional */}
        {config.results.showSubjectBreakdown && result.subjectBreakdown.length > 0 && (
          <SubjectBreakdown breakdown={result.subjectBreakdown} />
        )}

        {/* Stamina chart — client island, conditional */}
        {showStamina && (
          <div className="mt-4">
            <Suspense fallback={<ChartSkeleton />}>
              <StaminaChart blocks={staminaBlocks!} />
            </Suspense>
          </div>
        )}
      </section>

      {/* ── Section 3: Inline Question Review Cards ────────────────────────── */}
      <section aria-label="Question review">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8896A7] mb-3">
          Question Review
        </p>
        <Suspense fallback={<ReviewSkeleton />}>
          <ReviewCardList
            questions={reviewQuestions}
            questionHistory={questionHistory}
          />
        </Suspense>
      </section>

      {/* ── Section 4: Action CTAs ─────────────────────────────────────────── */}
      <section aria-label="Next steps">
        <Suspense fallback={<div className="h-24 animate-pulse" />}>
          <MergedCTAs
            sessionId={sessionId}
            missedCount={missedCount}
            isPerfect={isPerfect}
          />
        </Suspense>
      </section>
    </main>
  )
}

export default ResultsDashboard
