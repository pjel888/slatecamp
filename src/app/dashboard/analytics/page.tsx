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
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <ChartSkeleton height="h-[220px]" type="bar" />
          <ChartSkeleton height="h-[220px]" />
        </div>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <AnalyticsErrorBoundary fallbackHeight="h-[220px]">
            <ReadinessSection />
          </AnalyticsErrorBoundary>
          <AnalyticsErrorBoundary fallbackHeight="h-[220px]">
            <ExamCountdownSection />
          </AnalyticsErrorBoundary>
        </div>
      </Suspense>

      {/* Study Timeline Heatmap */}
      <Suspense key="timeline" fallback={<ChartSkeleton height="h-[140px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[140px]">
          <TimelineHeatmapSection />
        </AnalyticsErrorBoundary>
      </Suspense>

      {/* Session Performance Over Time */}
      <Suspense key="session-history" fallback={<ChartSkeleton height="h-[260px]" type="line" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[260px]">
          <SessionHistorySection />
        </AnalyticsErrorBoundary>
      </Suspense>

      {/* Monthly Progress Card + Simulation Trajectory */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <ChartSkeleton height="h-[280px]" />
          <ChartSkeleton height="h-[280px]" type="line" />
        </div>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
            <ProgressCardSection />
          </AnalyticsErrorBoundary>
          <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
            <SimulationTrajectorySection />
          </AnalyticsErrorBoundary>
        </div>
      </Suspense>

      {/* Performance: Pacing Quadrant + Stamina Curve */}
      <Suspense fallback={
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
          <div className="xl:col-span-7"><ChartSkeleton height="h-[360px]" /></div>
          <div className="xl:col-span-5"><ChartSkeleton height="h-[360px]" type="line" /></div>
        </div>
      }>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
          <div className="xl:col-span-7">
            <AnalyticsErrorBoundary fallbackHeight="h-[360px]">
              <PacingQuadrantSection />
            </AnalyticsErrorBoundary>
          </div>
          <div className="xl:col-span-5">
            <AnalyticsErrorBoundary fallbackHeight="h-[360px]">
              <StaminaSection />
            </AnalyticsErrorBoundary>
          </div>
        </div>
      </Suspense>

      {/* Performance: Stamina Heatmap + Difficulty vs Mastery */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <ChartSkeleton height="h-[340px]" />
          <ChartSkeleton height="h-[340px]" />
        </div>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <AnalyticsErrorBoundary fallbackHeight="h-[340px]">
            <StaminaHeatmapSection />
          </AnalyticsErrorBoundary>
          <AnalyticsErrorBoundary fallbackHeight="h-[340px]">
            <DifficultyMasterySection />
          </AnalyticsErrorBoundary>
        </div>
      </Suspense>

      {/* Accuracy by Subject + Response Time Distribution */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <ChartSkeleton height="h-[280px]" type="bar" />
          <ChartSkeleton height="h-[280px]" />
        </div>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
            <AccuracyBySubjectSection />
          </AnalyticsErrorBoundary>
          <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
            <TimeSpentDistributionSection />
          </AnalyticsErrorBoundary>
        </div>
      </Suspense>

      {/* Learning: Forgetting Curves + Study Velocity */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <ChartSkeleton height="h-[320px]" type="line" />
          <ChartSkeleton height="h-[320px]" />
        </div>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
            <ForgettingCurvesSection />
          </AnalyticsErrorBoundary>
          <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
            <StudyVelocitySection />
          </AnalyticsErrorBoundary>
        </div>
      </Suspense>

      {/* Subject Radar + Memory Health + Pacing Insights */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <ChartSkeleton height="h-[320px]" />
          <ChartSkeleton height="h-[320px]" />
          <ChartSkeleton height="h-[320px]" />
        </div>
      }>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
            <RadarSection />
          </AnalyticsErrorBoundary>
          <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
            <MemorySection />
          </AnalyticsErrorBoundary>
          <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
            <PacingInsightsSection />
          </AnalyticsErrorBoundary>
        </div>
      </Suspense>

      {/* Behavioral: Session Pacing vs Accuracy */}
      <Suspense key="pacing-accuracy" fallback={<ChartSkeleton height="h-[340px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[340px]">
          <PacingAccuracySection />
        </AnalyticsErrorBoundary>
      </Suspense>

      {/* Calibration Score (Brier) + Confidence Calibration + Study Activity Calendar */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <ChartSkeleton height="h-[280px]" />
          <ChartSkeleton height="h-[280px]" />
          <ChartSkeleton height="h-[280px]" />
        </div>
      }>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
            <CalibrationScoreSection />
          </AnalyticsErrorBoundary>
          <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
            <ConfidenceCalibrationSection />
          </AnalyticsErrorBoundary>
          <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
            <StudyStreakCalendarSection />
          </AnalyticsErrorBoundary>
        </div>
      </Suspense>

      {/* Topics to Focus On */}
      <Suspense key="weakest-topics" fallback={<ChartSkeleton height="h-[320px]" type="bar" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
          <WeakestTopicsSection />
        </AnalyticsErrorBoundary>
      </Suspense>

      {/* Error Pattern Distribution */}
      <Suspense key="error-patterns" fallback={<ChartSkeleton height="h-[320px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
          <ErrorPatternsSection />
        </AnalyticsErrorBoundary>
      </Suspense>

      {/* Exam Outcome Self-Report */}
      <Suspense key="exam-outcome" fallback={<ChartSkeleton height="h-[280px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[280px]">
          <ExamOutcomeSection />
        </AnalyticsErrorBoundary>
      </Suspense>
    </div>
  )
}
