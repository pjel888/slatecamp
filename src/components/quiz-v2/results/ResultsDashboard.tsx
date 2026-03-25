import { Suspense } from 'react'
import { ScoreReveal } from './ScoreReveal'
import { SubjectBreakdown } from './SubjectBreakdown'
import { ReadinessImpact } from './ReadinessImpact'
import { StaminaChart } from './StaminaChart'
import { ResultsCTAs } from './ResultsCTAs'
import type { EndSessionResult, QuizSessionConfig, StaminaBlock } from '@/types/quiz-config'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResultsDashboardProps {
  sessionId: string
  result: EndSessionResult
  config: QuizSessionConfig
  staminaBlocks?: StaminaBlock[]
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

const ScoreSkeleton = () => (
  <div className="bg-white rounded-md border border-[#D4DAE3] p-8 text-center animate-pulse">
    <div className="h-3 w-28 bg-[#F8F7F5] rounded mx-auto" />
    <div className="h-16 w-32 bg-[#F8F7F5] rounded mx-auto mt-4" />
    <div className="h-4 w-20 bg-[#F8F7F5] rounded mx-auto mt-3" />
  </div>
)

const CTASkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="h-11 bg-[#EEF2FC] rounded-sm" />
    <div className="h-11 bg-[#F8F7F5] rounded-sm" />
    <div className="h-8 bg-[#F8F7F5] rounded-sm" />
  </div>
)

const ChartSkeleton = () => (
  <div className="bg-white rounded-md border border-[#D4DAE3] p-4 h-40 animate-pulse" />
)

// ─── Component ────────────────────────────────────────────────────────────────

// This is a Server Component — no 'use client' directive.
// Client islands (ScoreReveal, StaminaChart, ResultsCTAs) are wrapped in Suspense.

const ResultsDashboard = ({
  sessionId,
  result,
  config,
  staminaBlocks,
}: ResultsDashboardProps) => {
  const showStamina =
    config.results.showStaminaChart &&
    staminaBlocks !== undefined &&
    staminaBlocks.length >= 2

  return (
    <main
      className="max-w-[680px] mx-auto px-4 py-8 space-y-6"
      aria-label="Session results"
    >
      {/* 1. Score reveal — client island, count-up animation */}
      <Suspense fallback={<ScoreSkeleton />}>
        <ScoreReveal
          percent={result.score.percent}
          correct={result.score.correct}
          total={result.score.total}
          growthDelta={config.results.showGrowthDelta ? result.growthVsPrevious : null}
        />
      </Suspense>

      {/* 2. Readiness impact — server, conditional */}
      {config.results.showReadinessScoreImpact && (
        <ReadinessImpact
          before={result.readinessScoreBefore}
          after={result.readinessScoreAfter}
          delta={result.readinessScoreDelta}
        />
      )}

      {/* 3. Subject breakdown — server, conditional */}
      {config.results.showSubjectBreakdown && result.subjectBreakdown.length > 0 && (
        <SubjectBreakdown breakdown={result.subjectBreakdown} />
      )}

      {/* 4. Stamina chart — client island, conditional on mode config */}
      {showStamina && (
        <Suspense fallback={<ChartSkeleton />}>
          <StaminaChart blocks={staminaBlocks!} />
        </Suspense>
      )}

      {/* 5. CTAs — client island */}
      <Suspense fallback={<CTASkeleton />}>
        <ResultsCTAs
          sessionId={sessionId}
          missedCount={result.missedQuestionCount}
        />
      </Suspense>
    </main>
  )
}

export default ResultsDashboard
