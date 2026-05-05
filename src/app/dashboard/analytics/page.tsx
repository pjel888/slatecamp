// Analytics Page — Server Component
// layout.tsx provides DataLayout — do NOT re-wrap here.
import { AnalyticsChartContainer } from '@/components/shared/analytics-chart-container'
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
import { SubjectMasteryServer } from '@/components/dashboard/SubjectMasteryServer'

export const dynamic = 'force-dynamic'

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-2">
      {/* Dashboard detail moved from Overview: Subject Mastery + Breakdown */}
      <AnalyticsChartContainer suspenseKey="subject-mastery" fallbackHeight="h-[520px]">
        <div className="h-[520px] min-h-0">
          <SubjectMasteryServer />
        </div>
      </AnalyticsChartContainer>

      {/* Top Row: Readiness Score + Exam Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <AnalyticsChartContainer fallbackHeight="h-[220px]" skeletonType="bar">
          <ReadinessSection />
        </AnalyticsChartContainer>
        <AnalyticsChartContainer fallbackHeight="h-[220px]">
          <ExamCountdownSection />
        </AnalyticsChartContainer>
      </div>

      {/* Study Timeline Heatmap */}
      <AnalyticsChartContainer suspenseKey="timeline" fallbackHeight="h-[140px]">
        <TimelineHeatmapSection />
      </AnalyticsChartContainer>

      {/* Session Performance Over Time */}
      <AnalyticsChartContainer suspenseKey="session-history" fallbackHeight="h-[260px]" skeletonType="line">
        <SessionHistorySection />
      </AnalyticsChartContainer>

      {/* Monthly Progress Card + Simulation Trajectory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <AnalyticsChartContainer fallbackHeight="h-[280px]">
          <ProgressCardSection />
        </AnalyticsChartContainer>
        <AnalyticsChartContainer fallbackHeight="h-[280px]" skeletonType="line">
          <SimulationTrajectorySection />
        </AnalyticsChartContainer>
      </div>

      {/* Performance: Pacing Quadrant + Stamina Curve */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        <div className="xl:col-span-7">
          <AnalyticsChartContainer fallbackHeight="h-[360px]">
            <PacingQuadrantSection />
          </AnalyticsChartContainer>
        </div>
        <div className="xl:col-span-5">
          <AnalyticsChartContainer fallbackHeight="h-[360px]" skeletonType="line">
            <StaminaSection />
          </AnalyticsChartContainer>
        </div>
      </div>

      {/* Performance: Stamina Heatmap + Difficulty vs Mastery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <AnalyticsChartContainer fallbackHeight="h-[340px]">
          <StaminaHeatmapSection />
        </AnalyticsChartContainer>
        <AnalyticsChartContainer fallbackHeight="h-[340px]">
          <DifficultyMasterySection />
        </AnalyticsChartContainer>
      </div>

      {/* Accuracy by Subject + Response Time Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <AnalyticsChartContainer fallbackHeight="h-[280px]" skeletonType="bar">
          <AccuracyBySubjectSection />
        </AnalyticsChartContainer>
        <AnalyticsChartContainer fallbackHeight="h-[280px]">
          <TimeSpentDistributionSection />
        </AnalyticsChartContainer>
      </div>

      {/* Learning: Forgetting Curves + Study Velocity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <AnalyticsChartContainer fallbackHeight="h-[320px]" skeletonType="line">
          <ForgettingCurvesSection />
        </AnalyticsChartContainer>
        <AnalyticsChartContainer fallbackHeight="h-[320px]">
          <StudyVelocitySection />
        </AnalyticsChartContainer>
      </div>

      {/* Subject Radar + Memory Health + Pacing Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <AnalyticsChartContainer fallbackHeight="h-[320px]">
          <RadarSection />
        </AnalyticsChartContainer>
        <AnalyticsChartContainer fallbackHeight="h-[320px]">
          <MemorySection />
        </AnalyticsChartContainer>
        <AnalyticsChartContainer fallbackHeight="h-[320px]">
          <PacingInsightsSection />
        </AnalyticsChartContainer>
      </div>

      {/* Behavioral: Session Pacing vs Accuracy */}
      <AnalyticsChartContainer suspenseKey="pacing-accuracy" fallbackHeight="h-[340px]">
        <PacingAccuracySection />
      </AnalyticsChartContainer>

      {/* Calibration Score (Brier) + Confidence Calibration + Study Activity Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <AnalyticsChartContainer fallbackHeight="h-[280px]">
          <CalibrationScoreSection />
        </AnalyticsChartContainer>
        <AnalyticsChartContainer fallbackHeight="h-[280px]">
          <ConfidenceCalibrationSection />
        </AnalyticsChartContainer>
        <AnalyticsChartContainer fallbackHeight="h-[280px]">
          <StudyStreakCalendarSection />
        </AnalyticsChartContainer>
      </div>

      {/* Topics to Focus On */}
      <AnalyticsChartContainer suspenseKey="weakest-topics" fallbackHeight="h-[320px]" skeletonType="bar">
        <WeakestTopicsSection />
      </AnalyticsChartContainer>

      {/* Error Pattern Distribution */}
      <AnalyticsChartContainer suspenseKey="error-patterns" fallbackHeight="h-[320px]">
        <ErrorPatternsSection />
      </AnalyticsChartContainer>

      {/* Exam Outcome Self-Report */}
      <AnalyticsChartContainer suspenseKey="exam-outcome" fallbackHeight="h-[280px]">
        <ExamOutcomeSection />
      </AnalyticsChartContainer>
    </div>
  )
}
