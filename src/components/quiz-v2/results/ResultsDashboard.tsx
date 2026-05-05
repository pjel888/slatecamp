import { Suspense } from 'react'
import { ScoreReveal } from './ScoreReveal'
import { SubjectBreakdown } from './SubjectBreakdown'
import { ReadinessImpact } from './ReadinessImpact'
import { StaminaChart } from './StaminaChart'
import { ConfidenceMatrix } from './ConfidenceMatrix'
import { ReviewCardList } from './ReviewCardList'
import { ResultsCTAs } from './ResultsCTAs'
import { ResultsWithPostdiction } from './ResultsWithPostdiction'
import { PredictionComparison } from './PredictionComparison'
import { FeedForwardCards } from './FeedForwardCards'
import { SimulationDebrief } from './SimulationDebrief'
import { CoachObservationCard } from './CoachObservationCard'
import type {
  EndSessionResult,
  QuizSessionConfig,
  StaminaBlock,
  ReviewQuestionData,
  QuestionHistoryStats,
  Recommendation,
} from '@/types/quiz-config'
import type { ConfidenceMatrixResult } from '@/lib/actions/quiz-v2/get-confidence-matrix'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PredictionData {
  predictionScore: number
  postdictionScore: number | null
}

interface ResultsDashboardProps {
  sessionId: string
  result: EndSessionResult
  config: QuizSessionConfig
  staminaBlocks?: StaminaBlock[]
  confidenceMatrix?: ConfidenceMatrixResult | null
  reviewQuestions: ReviewQuestionData[]
  questionHistory?: Record<string, QuestionHistoryStats>
  predictionData?: PredictionData | null
  recommendations?: Recommendation[]
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

const ScoreSkeleton = () => (
  <div className="bg-card rounded-md border border-border p-8 text-center animate-pulse">
    <div className="h-3 w-28 bg-surface-light rounded mx-auto" />
    <div className="h-16 w-32 bg-surface-light rounded mx-auto mt-4" />
    <div className="h-4 w-20 bg-surface-light rounded mx-auto mt-3" />
  </div>
)

const ChartSkeleton = () => (
  <div className="bg-card rounded-md border border-border p-4 h-40 animate-pulse" />
)

const ReviewSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-card rounded-md border border-border h-14" />
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
        <p className="text-base font-semibold text-success mb-4">
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
  confidenceMatrix,
  reviewQuestions,
  questionHistory,
  predictionData,
  recommendations,
}: ResultsDashboardProps) => {
  const showStamina =
    config.results.showStaminaChart &&
    staminaBlocks !== undefined &&
    staminaBlocks.length >= 2

  const missedCount = reviewQuestions.filter((q) => !q.isCorrect && !q.isSkipped).length
  const isPerfect = result.score.correct === result.score.total && result.score.total > 0
  const hasPrediction = predictionData !== null && predictionData !== undefined

  return (
    <ResultsWithPostdiction
      sessionId={sessionId}
      actualScore={result.score.percent}
      hasPrediction={hasPrediction}
    >
      <main
        className="mx-auto w-full max-w-[1180px] px-4 py-4 md:py-5 lg:h-[calc(100dvh-96px)] lg:overflow-hidden"
        aria-label="Session results"
        data-testid="quiz-results"
      >
        <div className="grid gap-4 lg:h-full lg:min-h-0 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)]">
          <div className="space-y-4 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
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
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              {/* Readiness impact — hidden in Chill mode */}
              {config.results.showReadinessScoreImpact && (
                <section aria-label="Readiness impact">
                  <ReadinessImpact
                    before={result.readinessScoreBefore}
                    after={result.readinessScoreAfter}
                    delta={result.readinessScoreDelta}
                  />
                </section>
              )}

              {/* ── Action CTAs near the score, not after a long scroll ─────────── */}
              <section
                aria-label="Next steps"
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Next Step
                </p>
                <Suspense fallback={<div className="h-24 animate-pulse" />}>
                  <MergedCTAs
                    sessionId={sessionId}
                    missedCount={missedCount}
                    isPerfect={isPerfect}
                  />
                </Suspense>
              </section>
            </div>

            {/* ── Coach behavioral observation — populated when behavioral data is available */}
            <CoachObservationCard observation={null} />

            {/* ── Section 2: Self-Assessment Accuracy ────────────────────────────── */}
            {hasPrediction && (
              <section aria-label="Self-assessment accuracy">
                <PredictionComparison
                  sessionId={sessionId}
                  predictionScore={predictionData.predictionScore}
                  postdictionScore={predictionData.postdictionScore}
                  actualScore={result.score.percent}
                />
              </section>
            )}

            {/* ── Section 3: Performance Breakdown ───────────────────────────────── */}
            <section aria-label="Performance breakdown" className="space-y-4">
              {config.results.showSubjectBreakdown && result.subjectBreakdown.length > 0 && (
                <SubjectBreakdown breakdown={result.subjectBreakdown} />
              )}

              {showStamina && (
                <Suspense fallback={<ChartSkeleton />}>
                  <StaminaChart blocks={staminaBlocks!} />
                </Suspense>
              )}
            </section>

            {/* ── Section 4: Confidence Diagnostic Matrix ─────────────────────── */}
            {confidenceMatrix && (
              <section aria-label="Confidence diagnostic">
                <ConfidenceMatrix matrix={confidenceMatrix} />
              </section>
            )}
          </div>

          <div className="space-y-4 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
            {/* ── Section 5: Simulation Debrief (full_exam only) ─────────────────── */}
            {config.mode === 'full_exam' && (
              <section aria-label="Simulation debrief">
                <Suspense fallback={<ChartSkeleton />}>
                  <SimulationDebrief
                    result={result}
                    reviewQuestions={reviewQuestions}
                    staminaBlocks={staminaBlocks}
                    prediction={hasPrediction ? predictionData.predictionScore : null}
                  />
                </Suspense>
              </section>
            )}

            {/* ── Section 6: Single-card Question Review ────────────────────────── */}
            <section aria-label="Question review">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Question Review
                  </p>
                  <p className="text-sm text-text-secondary">
                    One card at a time keeps the results page compact.
                  </p>
                </div>
              </div>
              <Suspense fallback={<ReviewSkeleton />}>
                <ReviewCardList
                  questions={reviewQuestions}
                  questionHistory={questionHistory}
                />
              </Suspense>
            </section>

            {/* ── Section 7: Feed-Forward Recommendations ────────────────────────── */}
            {recommendations && recommendations.length > 0 && (
              <section aria-label="Suggested next steps">
                <FeedForwardCards recommendations={recommendations} />
              </section>
            )}
          </div>
        </div>
      </main>
    </ResultsWithPostdiction>
  )
}

export default ResultsDashboard
