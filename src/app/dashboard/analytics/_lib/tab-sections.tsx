import 'server-only'
import type { ReactNode } from 'react'
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
import { IRTTrajectorySection } from '@/components/analytics/IRTTrajectorySection'
import { MasterySparklineSection } from '@/components/analytics/MasterySparklineSection'
import { ModeFunnelSection } from '@/components/analytics/ModeFunnelSection'
import { MetacognitionSection } from '@/components/analytics/MetacognitionSection'
import { RelearningVelocitySection } from '@/components/analytics/RelearningVelocitySection'
import { ReadingCorrelationSection } from '@/components/analytics/ReadingCorrelationSection'
import { ReadingDepthSection } from '@/components/analytics/ReadingDepthSection'
import { MultimodalStudySection } from '@/components/analytics/MultimodalStudySection'
import { TopicIntelligenceSection } from '@/components/analytics/TopicIntelligenceSection'
import { SubjectMasteryServer } from '@/components/dashboard/SubjectMasteryServer'
import type {
  AnalyticsDetailId,
  AnalyticsTabId,
} from '@/lib/analytics/tabs'
import { cn } from '@/lib/utils'

type SkeletonType = 'bar' | 'line' | 'table' | 'generic'
type PanelMode = 'primary' | 'detail'

interface PanelSlotProps {
  children: ReactNode
  className?: string
  fallbackHeight?: string
  mode: PanelMode
  panelId: string
  skeletonType?: SkeletonType
  suspenseKey?: string
}

interface AnalyticsTabPanelDefinition {
  render: () => ReactNode
}

interface AnalyticsDetailPanelDefinition {
  render: () => ReactNode
}

interface PanelGridProps {
  children: ReactNode
  className?: string
  detailId?: AnalyticsDetailId
  id: AnalyticsTabId
  label: string
}

const panelGridClass =
  'grid h-full min-h-0 grid-cols-1 gap-2 overflow-hidden max-md:overflow-y-auto md:grid-cols-12'

const slotClass = 'min-h-[188px] overflow-hidden rounded-md md:min-h-0'

const PanelSlot = ({
  children,
  className,
  fallbackHeight = 'h-full',
  mode,
  panelId,
  skeletonType = 'generic',
  suspenseKey,
}: PanelSlotProps) => (
  <div
    className={cn(slotClass, '[&>*]:h-full', className)}
    data-analytics-primary-panel={mode === 'primary' ? panelId : undefined}
    data-analytics-detail-panel={mode === 'detail' ? panelId : undefined}
  >
    <AnalyticsChartContainer
      fallbackHeight={fallbackHeight}
      skeletonType={skeletonType}
      suspenseKey={suspenseKey}
    >
      {children}
    </AnalyticsChartContainer>
  </div>
)

const PanelGrid = ({
  children,
  className,
  detailId,
  id,
  label,
}: PanelGridProps) => (
  <div
    className={cn(panelGridClass, className)}
    role="region"
    aria-label={label}
    tabIndex={0}
    data-analytics-detail={detailId}
    data-analytics-panel-scroll-region={id}
    data-analytics-tab-panel={id}
  >
    {children}
  </div>
)

const ReadyPanel = () => (
  <PanelGrid
    id="ready"
    label="Ready analytics panel"
    className="md:grid-rows-1"
  >
    <PanelSlot
      className="md:col-span-6"
      mode="primary"
      panelId="subject-mastery"
      suspenseKey="subject-mastery"
    >
      <SubjectMasteryServer variant="compact" />
    </PanelSlot>
    <PanelSlot
      className="md:col-span-3"
      mode="primary"
      panelId="readiness"
      skeletonType="bar"
    >
      <ReadinessSection />
    </PanelSlot>
    <PanelSlot
      className="md:col-span-3"
      mode="primary"
      panelId="exam-countdown"
    >
      <ExamCountdownSection />
    </PanelSlot>
  </PanelGrid>
)

const FocusPanel = () => (
  <PanelGrid
    id="focus"
    label="Focus analytics panel"
    className="md:grid-rows-1"
  >
    <PanelSlot
      className="md:col-span-4"
      mode="primary"
      panelId="weakest-topics"
      skeletonType="bar"
    >
      <WeakestTopicsSection />
    </PanelSlot>
    <PanelSlot
      className="md:col-span-5"
      mode="primary"
      panelId="topic-intelligence"
    >
      <TopicIntelligenceSection heightClassName="h-full" variant="compact" />
    </PanelSlot>
    <PanelSlot
      className="md:col-span-3"
      mode="primary"
      panelId="error-patterns"
    >
      <ErrorPatternsSection />
    </PanelSlot>
  </PanelGrid>
)

const PracticePanel = () => (
  <PanelGrid
    id="practice"
    label="Practice analytics panel"
    className="md:grid-rows-1"
  >
    <PanelSlot
      className="md:col-span-5"
      mode="primary"
      panelId="session-history"
      skeletonType="line"
    >
      <SessionHistorySection />
    </PanelSlot>
    <PanelSlot
      className="md:col-span-4"
      mode="primary"
      panelId="accuracy-by-subject"
      skeletonType="bar"
    >
      <AccuracyBySubjectSection />
    </PanelSlot>
    <PanelSlot
      className="md:col-span-3"
      mode="primary"
      panelId="pacing-insights"
    >
      <PacingInsightsSection />
    </PanelSlot>
  </PanelGrid>
)

const HabitsPanel = () => (
  <PanelGrid
    id="habits"
    label="Habits analytics panel"
    className="md:grid-rows-1"
  >
    <PanelSlot
      className="md:col-span-4"
      mode="primary"
      panelId="study-streak"
    >
      <StudyStreakCalendarSection variant="compact" />
    </PanelSlot>
    <PanelSlot
      className="md:col-span-4"
      mode="primary"
      panelId="timeline-heatmap"
      suspenseKey="timeline"
    >
      <TimelineHeatmapSection variant="compact" />
    </PanelSlot>
    <PanelSlot
      className="md:col-span-4"
      mode="primary"
      panelId="forgetting-curves"
      skeletonType="line"
    >
      <ForgettingCurvesSection />
    </PanelSlot>
  </PanelGrid>
)

const ReadinessDiagnosticsPanel = () => (
  <PanelGrid
    id="ready"
    detailId="readiness-diagnostics"
    label="Readiness diagnostics"
    className="md:grid-rows-1"
  >
    <PanelSlot className="md:col-span-3" mode="detail" panelId="simulation">
      <SimulationTrajectorySection />
    </PanelSlot>
    <PanelSlot
      className="md:col-span-3"
      mode="detail"
      panelId="irt-trajectory"
      skeletonType="line"
    >
      <IRTTrajectorySection />
    </PanelSlot>
    <PanelSlot className="md:col-span-3" mode="detail" panelId="progress-card">
      <ProgressCardSection variant="compact" />
    </PanelSlot>
    <PanelSlot className="md:col-span-3" mode="detail" panelId="radar">
      <RadarSection />
    </PanelSlot>
  </PanelGrid>
)

const CalibrationDiagnosticsPanel = () => (
  <PanelGrid
    id="ready"
    detailId="calibration"
    label="Calibration diagnostics"
    className="md:grid-rows-1"
  >
    <PanelSlot className="md:col-span-4" mode="detail" panelId="calibration-score">
      <CalibrationScoreSection />
    </PanelSlot>
    <PanelSlot
      className="md:col-span-4"
      mode="detail"
      panelId="confidence-calibration"
    >
      <ConfidenceCalibrationSection />
    </PanelSlot>
    <PanelSlot className="md:col-span-4" mode="detail" panelId="metacognition">
      <MetacognitionSection />
    </PanelSlot>
  </PanelGrid>
)

const ExamOutcomePanel = () => (
  <PanelGrid
    id="ready"
    detailId="exam-outcome"
    label="Exam outcome diagnostics"
    className="md:grid-rows-1"
  >
    <PanelSlot className="md:col-span-12" mode="detail" panelId="exam-outcome">
      <ExamOutcomeSection />
    </PanelSlot>
  </PanelGrid>
)

const PacingDiagnosticsPanel = () => (
  <PanelGrid
    id="practice"
    detailId="pacing"
    label="Pacing diagnostics"
    className="md:grid-rows-1"
  >
    <PanelSlot className="md:col-span-3" mode="detail" panelId="pacing-quadrant">
      <PacingQuadrantSection />
    </PanelSlot>
    <PanelSlot
      className="md:col-span-3"
      mode="detail"
      panelId="pacing-accuracy"
      skeletonType="line"
    >
      <PacingAccuracySection />
    </PanelSlot>
    <PanelSlot
      className="md:col-span-3"
      mode="detail"
      panelId="difficulty-mastery"
    >
      <DifficultyMasterySection />
    </PanelSlot>
    <PanelSlot className="md:col-span-3" mode="detail" panelId="time-spent">
      <TimeSpentDistributionSection />
    </PanelSlot>
  </PanelGrid>
)

const RetentionDiagnosticsPanel = () => (
  <PanelGrid
    id="habits"
    detailId="retention"
    label="Retention diagnostics"
    className="md:grid-rows-2"
  >
    <PanelSlot className="md:col-span-4" mode="detail" panelId="memory">
      <MemorySection />
    </PanelSlot>
    <PanelSlot
      className="md:col-span-4"
      mode="detail"
      panelId="study-velocity"
      skeletonType="line"
    >
      <StudyVelocitySection />
    </PanelSlot>
    <PanelSlot
      className="md:col-span-4"
      mode="detail"
      panelId="relearning-velocity"
      skeletonType="line"
    >
      <RelearningVelocitySection />
    </PanelSlot>
    <PanelSlot className="md:col-span-4" mode="detail" panelId="reading-correlation">
      <ReadingCorrelationSection />
    </PanelSlot>
    <PanelSlot className="md:col-span-4" mode="detail" panelId="reading-depth">
      <ReadingDepthSection />
    </PanelSlot>
    <PanelSlot
      className="md:col-span-4"
      mode="detail"
      panelId="mastery-sparkline"
      skeletonType="line"
    >
      <MasterySparklineSection />
    </PanelSlot>
  </PanelGrid>
)

const StaminaDiagnosticsPanel = () => (
  <PanelGrid
    id="habits"
    detailId="stamina"
    label="Stamina diagnostics"
    className="md:grid-rows-1"
  >
    <PanelSlot
      className="md:col-span-3"
      mode="detail"
      panelId="stamina"
      skeletonType="line"
    >
      <StaminaSection />
    </PanelSlot>
    <PanelSlot className="md:col-span-4" mode="detail" panelId="stamina-heatmap">
      <StaminaHeatmapSection variant="compact" />
    </PanelSlot>
    <PanelSlot className="md:col-span-3" mode="detail" panelId="mode-funnel">
      <ModeFunnelSection />
    </PanelSlot>
    <PanelSlot className="md:col-span-2" mode="detail" panelId="multimodal-study">
      <MultimodalStudySection />
    </PanelSlot>
  </PanelGrid>
)

export const ANALYTICS_TAB_PANELS: Record<
  AnalyticsTabId,
  AnalyticsTabPanelDefinition
> = {
  ready: {
    render: () => <ReadyPanel />,
  },
  focus: {
    render: () => <FocusPanel />,
  },
  practice: {
    render: () => <PracticePanel />,
  },
  habits: {
    render: () => <HabitsPanel />,
  },
}

export const ANALYTICS_DETAIL_PANELS: Record<
  AnalyticsDetailId,
  AnalyticsDetailPanelDefinition
> = {
  'readiness-diagnostics': {
    render: () => <ReadinessDiagnosticsPanel />,
  },
  calibration: {
    render: () => <CalibrationDiagnosticsPanel />,
  },
  'exam-outcome': {
    render: () => <ExamOutcomePanel />,
  },
  pacing: {
    render: () => <PacingDiagnosticsPanel />,
  },
  retention: {
    render: () => <RetentionDiagnosticsPanel />,
  },
  stamina: {
    render: () => <StaminaDiagnosticsPanel />,
  },
}
