// Analytics Page — Server Component
// layout.tsx provides SharedPageLayout — do NOT re-wrap here.
import { Suspense } from 'react'
import {
  getReadinessTrajectory,
  getPacingQuadrantData,
  getStaminaCurveData,
  getPacingInsights,
  getMemoryHealthData,
  getAnalyticsSummaryMetrics,
} from '@/lib/actions/analytics'
import { getSubjectMasteryData } from '@/lib/actions/mastery'
import { getReadinessScore } from '@/lib/actions/readiness'
import { SubjectRadarChart } from '@/components/dashboard/SubjectRadarChart'
import { AnalyticsSummaryBar } from '@/components/analytics/AnalyticsSummaryBar'
import { ReadinessTrajectory } from '@/components/analytics/ReadinessTrajectory'
import { PacingQuadrant } from '@/components/analytics/PacingQuadrant'
import { StaminaCurve } from '@/components/analytics/StaminaCurve'
import { PacingInsights } from '@/components/analytics/PacingInsights'
import { MemoryHealthMap } from '@/components/analytics/MemoryHealthMap'

function ChartSkeleton({ height = 'h-[200px]' }: { height?: string }) {
  return (
    <div className={`rounded-md border border-border/50 bg-white ${height} animate-pulse`}>
      <div className="p-3 flex flex-col h-full gap-2">
        <div className="h-2 w-24 bg-zinc-100 rounded" />
        <div className="flex-1 bg-zinc-50 rounded" />
      </div>
    </div>
  )
}

async function SummarySection() {
  const metrics = await getAnalyticsSummaryMetrics()
  return <AnalyticsSummaryBar data={metrics} />
}

async function ReadinessSection() {
  const [trajectory, readiness] = await Promise.all([
    getReadinessTrajectory(),
    getReadinessScore(),
  ])
  return (
    <ReadinessTrajectory
      data={trajectory}
      currentScore={readiness.score}
      previousScore={readiness.previousScore}
    />
  )
}

async function PacingQuadrantSection() {
  const data = await getPacingQuadrantData()
  return <PacingQuadrant data={data} targetTimeMs={120_000} passingAccuracy={75} />
}

async function StaminaSection() {
  const data = await getStaminaCurveData()
  return <StaminaCurve data={data} />
}

async function RadarSection() {
  const data = await getSubjectMasteryData()
  return <SubjectRadarChart data={data} />
}

async function MemorySection() {
  const data = await getMemoryHealthData()
  return <MemoryHealthMap data={data} />
}

async function PacingInsightsSection() {
  const data = await getPacingInsights()
  return <PacingInsights data={data} />
}

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
