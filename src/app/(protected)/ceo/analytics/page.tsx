import { Suspense } from 'react'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ChartSkeleton } from '@/components/ceo/skeletons/ChartSkeleton'
import { AnalyticsErrorBoundary } from '@/components/analytics/AnalyticsErrorBoundary'
import { AdoptionFunnelSection } from '@/components/ceo/analytics/AdoptionFunnelSection'
import { ContentEffectivenessSection } from '@/components/ceo/analytics/ContentEffectivenessSection'
import { EngagementDepthSection } from '@/components/ceo/analytics/EngagementDepthSection'
import { CoverageGapSection } from '@/components/ceo/analytics/CoverageGapSection'
import { PassRateSection } from '@/components/ceo/analytics/PassRateSection'
import { CAGEQualitySection } from '@/components/ceo/analytics/CAGEQualitySection'
import { StudyCohortSection } from '@/components/ceo/analytics/StudyCohortSection'
import { QuestionHealthSection } from '@/components/ceo/analytics/QuestionHealthSection'
import { LearningVelocitySection } from '@/components/ceo/analytics/LearningVelocitySection'
import { verifyCeoAccess } from '@/lib/queries/ceo/auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Analytics — CEO Dashboard',
}

export default async function CEOAnalyticsPage() {
  await verifyCeoAccess()
  return (
    <div className="flex flex-col gap-8 max-w-screen-xl">

      {/* Adoption Funnel */}
      <section className="space-y-3">
        <Eyebrow>Adoption Funnel</Eyebrow>
        <AnalyticsErrorBoundary>
          <Suspense fallback={<ChartSkeleton className="h-[320px]" />}>
            <AdoptionFunnelSection />
          </Suspense>
        </AnalyticsErrorBoundary>
      </section>

      {/* Content Effectiveness */}
      <section className="space-y-3">
        <Eyebrow>Content Effectiveness</Eyebrow>
        <AnalyticsErrorBoundary>
          <Suspense fallback={<ChartSkeleton className="h-[320px]" />}>
            <ContentEffectivenessSection />
          </Suspense>
        </AnalyticsErrorBoundary>
      </section>

      {/* Engagement Depth */}
      <section className="space-y-3">
        <Eyebrow>Engagement Depth Score</Eyebrow>
        <AnalyticsErrorBoundary>
          <Suspense fallback={<ChartSkeleton className="h-[320px]" />}>
            <EngagementDepthSection />
          </Suspense>
        </AnalyticsErrorBoundary>
      </section>

      {/* Coverage Gap */}
      <section className="space-y-3">
        <Eyebrow>Coverage Gap</Eyebrow>
        <AnalyticsErrorBoundary>
          <Suspense fallback={<ChartSkeleton className="h-[320px]" />}>
            <CoverageGapSection />
          </Suspense>
        </AnalyticsErrorBoundary>
      </section>

      {/* Pass Rate Prediction */}
      <section className="space-y-3">
        <Eyebrow>Pass Rate Prediction</Eyebrow>
        <AnalyticsErrorBoundary>
          <Suspense fallback={<ChartSkeleton className="h-[320px]" />}>
            <PassRateSection />
          </Suspense>
        </AnalyticsErrorBoundary>
      </section>

      {/* CAGE Quality */}
      <section className="space-y-3">
        <Eyebrow>CAGE Quality</Eyebrow>
        <AnalyticsErrorBoundary>
          <Suspense fallback={<ChartSkeleton className="h-[280px]" />}>
            <CAGEQualitySection />
          </Suspense>
        </AnalyticsErrorBoundary>
      </section>

      {/* Study Cohorts */}
      <section className="space-y-3">
        <Eyebrow>Study Cohorts</Eyebrow>
        <AnalyticsErrorBoundary>
          <Suspense fallback={<ChartSkeleton className="h-[320px]" />}>
            <StudyCohortSection />
          </Suspense>
        </AnalyticsErrorBoundary>
      </section>

      {/* Question Health */}
      <section className="space-y-3">
        <Eyebrow>Question Health</Eyebrow>
        <AnalyticsErrorBoundary>
          <Suspense fallback={<ChartSkeleton className="h-[400px]" />}>
            <QuestionHealthSection />
          </Suspense>
        </AnalyticsErrorBoundary>
      </section>

      {/* Learning Velocity */}
      <section className="space-y-3">
        <Eyebrow>Learning Velocity</Eyebrow>
        <AnalyticsErrorBoundary>
          <Suspense fallback={<ChartSkeleton className="h-[320px]" />}>
            <LearningVelocitySection />
          </Suspense>
        </AnalyticsErrorBoundary>
      </section>

    </div>
  )
}
