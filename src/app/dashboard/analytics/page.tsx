// Analytics Page — Server Component
// layout.tsx provides SharedPageLayout — do NOT re-wrap here.
import { Suspense } from 'react'
import { ChartSkeleton } from '@/components/analytics/ChartSkeleton'
import { SummarySection } from '@/components/analytics/SummarySection'
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
import { StudyStreakCalendarSection } from '@/components/analytics/StudyStreakCalendarSection'
import { ProgressCardSection } from '@/components/analytics/ProgressCardSection'
import { SimulationTrajectorySection } from '@/components/analytics/SimulationTrajectorySection'
import { ExamOutcomeSection } from '@/components/analytics/ExamOutcomeSection'

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-2">
      {/* Summary Metrics Bar */}
      <Suspense fallback={<ChartSkeleton height="h-[64px]" />}>
        <SummarySection />
      </Suspense>

      {/* Top Row: Readiness Score + Exam Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Suspense fallback={<ChartSkeleton height="h-[220px]" />}>
          <ReadinessSection />
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[220px]" />}>
          <ExamCountdownSection />
        </Suspense>
      </div>

      {/* Study Timeline Heatmap */}
      <Suspense fallback={<ChartSkeleton height="h-[140px]" />}>
        <TimelineHeatmapSection />
      </Suspense>

      {/* Session Performance Over Time */}
      <Suspense fallback={<ChartSkeleton height="h-[260px]" />}>
        <SessionHistorySection />
      </Suspense>

      {/* Monthly Progress Card + Simulation Trajectory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
          <ProgressCardSection />
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
          <SimulationTrajectorySection />
        </Suspense>
      </div>

      {/* Performance: Pacing Quadrant + Stamina Curve */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        <div className="xl:col-span-7">
          <Suspense fallback={<ChartSkeleton height="h-[360px]" />}>
            <PacingQuadrantSection />
          </Suspense>
        </div>
        <div className="xl:col-span-5">
          <Suspense fallback={<ChartSkeleton height="h-[360px]" />}>
            <StaminaSection />
          </Suspense>
        </div>
      </div>

      {/* Performance: Stamina Heatmap + Difficulty vs Mastery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Suspense fallback={<ChartSkeleton height="h-[340px]" />}>
          <StaminaHeatmapSection />
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[340px]" />}>
          <DifficultyMasterySection />
        </Suspense>
      </div>

      {/* Accuracy by Subject + Response Time Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
          <AccuracyBySubjectSection />
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
          <TimeSpentDistributionSection />
        </Suspense>
      </div>

      {/* Learning: Forgetting Curves + Study Velocity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
          <ForgettingCurvesSection />
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
          <StudyVelocitySection />
        </Suspense>
      </div>

      {/* Subject Radar + Memory Health + Pacing Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
          <RadarSection />
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
          <MemorySection />
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
          <PacingInsightsSection />
        </Suspense>
      </div>

      {/* Behavioral: Session Pacing vs Accuracy */}
      <Suspense fallback={<ChartSkeleton height="h-[340px]" />}>
        <PacingAccuracySection />
      </Suspense>

      {/* Calibration Score (Brier) + Confidence Calibration + Study Activity Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
          <CalibrationScoreSection />
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
          <ConfidenceCalibrationSection />
        </Suspense>
        <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
          <StudyStreakCalendarSection />
        </Suspense>
      </div>

      {/* Topics to Focus On */}
      <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
        <WeakestTopicsSection />
      </Suspense>

      {/* Exam Outcome Self-Report */}
      <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
        <ExamOutcomeSection />
      </Suspense>
    </div>
  )
}
