// Analytics Page — Server Component
// layout.tsx provides SharedPageLayout — do NOT re-wrap here.
import { Suspense } from 'react'
import { ChartSkeleton } from '@/components/analytics/ChartSkeleton'
import { AnalyticsErrorBoundary } from '@/components/analytics/AnalyticsErrorBoundary'
import { ReadinessSection } from '@/components/analytics/ReadinessSection'
import { ExamCountdownSection } from '@/components/analytics/ExamCountdownSection'
import { PacingQuadrantSection } from '@/components/analytics/PacingQuadrantSection'
import { StaminaSection } from '@/components/analytics/StaminaSection'
import { StaminaHeatmapSection } from '@/components/analytics/StaminaHeatmapSection'
import { DifficultyMasterySection } from '@/components/analytics/DifficultyMasterySection'
import { PacingAccuracySection } from '@/components/analytics/PacingAccuracySection'
import { ForgettingCurvesSection } from '@/components/analytics/ForgettingCurvesSection'
import { StudyVelocitySection } from '@/components/analytics/StudyVelocitySection'
import { RadarSection } from '@/components/analytics/RadarSection'
import { MemorySection } from '@/components/analytics/MemorySection'
import { PacingInsightsSection } from '@/components/analytics/PacingInsightsSection'
import { TimelineHeatmapSection } from '@/components/analytics/TimelineHeatmapSection'
import { AccuracyBySubjectSection } from '@/components/analytics/AccuracyBySubjectSection'
import { TimeSpentDistributionSection } from '@/components/analytics/TimeSpentDistributionSection'
import { SessionHistorySection } from '@/components/analytics/SessionHistorySection'
import { ConfidenceCalibrationSection } from '@/components/analytics/ConfidenceCalibrationSection'
import { CalibrationScoreSection } from '@/components/analytics/CalibrationScoreSection'
import { WeakestTopicsSection } from '@/components/analytics/WeakestTopicsSection'
import { ErrorPatternsSection } from '@/components/analytics/ErrorPatternsSection'
import { StudyStreakCalendarSection } from '@/components/analytics/StudyStreakCalendarSection'
import { ProgressCardSection } from '@/components/analytics/ProgressCardSection'
import { SimulationTrajectorySection } from '@/components/analytics/SimulationTrajectorySection'
import { ExamOutcomeSection } from '@/components/analytics/ExamOutcomeSection'

export const dynamic = 'force-dynamic'

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-2">
      {/* Top Row: Readiness Score + Exam Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Suspense fallback={<ChartSkeleton height="h-[220px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[220px]">
            <ReadinessSection />
          </AnalyticsErrorBoundary>
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[220px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[220px]">
            <ExamCountdownSection />
          </AnalyticsErrorBoundary>
        </Suspense>
      </div>

      {/* Study Timeline Heatmap */}
      <Suspense fallback={<ChartSkeleton height="h-[140px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[140px]">
          <TimelineHeatmapSection />
        </AnalyticsErrorBoundary>
      </Suspense>

      {/* Session Performance Over Time */}
      <Suspense fallback={<ChartSkeleton height="h-[260px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[260px]">
          <SessionHistorySection />
        </AnalyticsErrorBoundary>
      </Suspense>

      {/* Monthly Progress Card + Simulation Trajectory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
            <ProgressCardSection />
          </AnalyticsErrorBoundary>
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
            <SimulationTrajectorySection />
          </AnalyticsErrorBoundary>
        </Suspense>
      </div>

      {/* Performance: Pacing Quadrant + Stamina Curve */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        <div className="xl:col-span-7">
          <Suspense fallback={<ChartSkeleton height="h-[360px]" />}>
            <AnalyticsErrorBoundary fallbackHeight="h-[360px]">
              <PacingQuadrantSection />
            </AnalyticsErrorBoundary>
          </Suspense>
        </div>
        <div className="xl:col-span-5">
          <Suspense fallback={<ChartSkeleton height="h-[360px]" />}>
            <AnalyticsErrorBoundary fallbackHeight="h-[360px]">
              <StaminaSection />
            </AnalyticsErrorBoundary>
          </Suspense>
        </div>
      </div>

      {/* Performance: Stamina Heatmap + Difficulty vs Mastery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Suspense fallback={<ChartSkeleton height="h-[340px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[340px]">
            <StaminaHeatmapSection />
          </AnalyticsErrorBoundary>
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[340px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[340px]">
            <DifficultyMasterySection />
          </AnalyticsErrorBoundary>
        </Suspense>
      </div>

      {/* Accuracy by Subject + Response Time Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
            <AccuracyBySubjectSection />
          </AnalyticsErrorBoundary>
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
            <TimeSpentDistributionSection />
          </AnalyticsErrorBoundary>
        </Suspense>
      </div>

      {/* Learning: Forgetting Curves + Study Velocity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
            <ForgettingCurvesSection />
          </AnalyticsErrorBoundary>
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
            <StudyVelocitySection />
          </AnalyticsErrorBoundary>
        </Suspense>
      </div>

      {/* Subject Radar + Memory Health + Pacing Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
            <RadarSection />
          </AnalyticsErrorBoundary>
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
            <MemorySection />
          </AnalyticsErrorBoundary>
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
            <PacingInsightsSection />
          </AnalyticsErrorBoundary>
        </Suspense>
      </div>

      {/* Behavioral: Session Pacing vs Accuracy */}
      <Suspense fallback={<ChartSkeleton height="h-[340px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[340px]">
          <PacingAccuracySection />
        </AnalyticsErrorBoundary>
      </Suspense>

      {/* Calibration Score (Brier) + Confidence Calibration + Study Activity Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
            <CalibrationScoreSection />
          </AnalyticsErrorBoundary>
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
            <ConfidenceCalibrationSection />
          </AnalyticsErrorBoundary>
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
          <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
            <StudyStreakCalendarSection />
          </AnalyticsErrorBoundary>
        </Suspense>
      </div>

      {/* Topics to Focus On */}
      <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
          <WeakestTopicsSection />
        </AnalyticsErrorBoundary>
      </Suspense>

      {/* Error Pattern Distribution */}
      <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
          <ErrorPatternsSection />
        </AnalyticsErrorBoundary>
      </Suspense>

      {/* Exam Outcome Self-Report */}
      <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
          <ExamOutcomeSection />
        </AnalyticsErrorBoundary>
      </Suspense>
    </div>
  )
}
