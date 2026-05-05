import { Suspense } from 'react'
import { HeroCommandBarSkeleton } from '@/components/dashboard/HeroCommandBar'
import { HeroCommandBarServer } from '@/components/dashboard/HeroCommandBarServer'
import {
  HeatmapSection,
  HeatmapSectionSkeleton,
} from '@/components/dashboard/HeatmapSection'
import { StreakRibbonSkeleton } from '@/components/dashboard/StreakRibbonSkeleton'
import { StreakRibbonServer } from '@/components/dashboard/StreakRibbonServer'
import { ResultsDayBannerServer } from '@/components/dashboard/ResultsDayBannerServer'
import { TransitionPromptServer } from '@/components/dashboard/TransitionPromptServer'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { DashboardAnalyticsSync } from '@/components/dashboard/DashboardAnalyticsSync'

export default async function DashboardPage() {
  return (
    <SharedPageLayout>
      <DashboardAnalyticsSync />

      <div className='pointer-events-none absolute inset-0 z-0 bg-[url("/images/dashboard/Dashboard-BG-Image.png")] bg-cover bg-bottom bg-no-repeat opacity-75' />

      <div className='relative z-10 flex h-full min-h-0 w-full flex-col gap-2 overflow-y-auto lg:overflow-hidden'>
        {/* ── Primary Hero: Readiness Score + Greeting + Heatmap ────────── */}
        <Suspense key='hero' fallback={<HeroCommandBarSkeleton />}>
          <HeroCommandBarServer>
            <Suspense key='heatmap' fallback={<HeatmapSectionSkeleton />}>
              <HeatmapSection />
            </Suspense>
          </HeroCommandBarServer>
        </Suspense>

        {/* ── Professional Mode Transition (passer or opt-in) ── */}
        <Suspense key='transition-prompt' fallback={null}>
          <TransitionPromptServer />
        </Suspense>

        {/* ── Results Day Banner (exam_date 3-14 days ago, no result yet) ── */}
        <Suspense key='results-banner' fallback={null}>
          <ResultsDayBannerServer />
        </Suspense>

        {/* ── Streak Ribbon + Locked Score ────────────────── */}
        <Suspense key='streak-ribbon' fallback={<StreakRibbonSkeleton />}>
          <StreakRibbonServer />
        </Suspense>
      </div>
    </SharedPageLayout>
  )
}
