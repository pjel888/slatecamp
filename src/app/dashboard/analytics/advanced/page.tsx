import { Suspense } from 'react'
import { ChartSkeleton } from '@/components/analytics/ChartSkeleton'
import { AnalyticsErrorBoundary } from '@/components/analytics/AnalyticsErrorBoundary'
import { IRTTrajectorySection } from '@/components/analytics/IRTTrajectorySection'
import { MasterySparklineSection } from '@/components/analytics/MasterySparklineSection'
import { ModeFunnelSection } from '@/components/analytics/ModeFunnelSection'
import { MetacognitionSection } from '@/components/analytics/MetacognitionSection'
import { RelearningVelocitySection } from '@/components/analytics/RelearningVelocitySection'
import { ReadingCorrelationSection } from '@/components/analytics/ReadingCorrelationSection'
import { ReadingDepthSection } from '@/components/analytics/ReadingDepthSection'
import { MultimodalStudySection } from '@/components/analytics/MultimodalStudySection'
import { TopicIntelligenceSection } from '@/components/analytics/TopicIntelligenceSection'

export const dynamic = 'force-dynamic'

const AdvancedAnalyticsPage = () => {
  return (
    <div className="flex flex-col gap-2">
      <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
          <IRTTrajectorySection />
        </AnalyticsErrorBoundary>
      </Suspense>

      <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
          <MasterySparklineSection />
        </AnalyticsErrorBoundary>
      </Suspense>

      <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
          <ModeFunnelSection />
        </AnalyticsErrorBoundary>
      </Suspense>

      <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
          <MetacognitionSection />
        </AnalyticsErrorBoundary>
      </Suspense>

      <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
          <RelearningVelocitySection />
        </AnalyticsErrorBoundary>
      </Suspense>

      <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
          <ReadingCorrelationSection />
        </AnalyticsErrorBoundary>
      </Suspense>

      <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
          <ReadingDepthSection />
        </AnalyticsErrorBoundary>
      </Suspense>

      <Suspense fallback={<ChartSkeleton height="h-[320px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[320px]">
          <MultimodalStudySection />
        </AnalyticsErrorBoundary>
      </Suspense>

      <Suspense fallback={<ChartSkeleton height="h-[400px]" />}>
        <AnalyticsErrorBoundary fallbackHeight="h-[400px]">
          <TopicIntelligenceSection />
        </AnalyticsErrorBoundary>
      </Suspense>
    </div>
  )
}

export default AdvancedAnalyticsPage
