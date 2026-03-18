// Analytics Page — Server Component
// layout.tsx provides SharedPageLayout — do NOT re-wrap here.
import { Suspense } from 'react'
import { ChartSkeleton } from '@/components/analytics/ChartSkeleton'
import { SummarySection } from '@/components/analytics/SummarySection'
import { ReadinessSection } from '@/components/analytics/ReadinessSection'
import { PacingQuadrantSection } from '@/components/analytics/PacingQuadrantSection'
import { StaminaSection } from '@/components/analytics/StaminaSection'
import { RadarSection } from '@/components/analytics/RadarSection'
import { MemorySection } from '@/components/analytics/MemorySection'
import { PacingInsightsSection } from '@/components/analytics/PacingInsightsSection'

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-2">
      {/* Summary Metrics Bar */}
      <Suspense fallback={<ChartSkeleton height="h-[64px]" />}>
        <SummarySection />
      </Suspense>

      {/* Readiness Trajectory */}
      <Suspense fallback={<ChartSkeleton height="h-[220px]" />}>
        <ReadinessSection />
      </Suspense>

      {/* Pacing Quadrant (signature) + Stamina Curve */}
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
    </div>
  )
}
