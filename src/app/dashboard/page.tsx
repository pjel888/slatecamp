import { Suspense } from 'react'
import { getDashboardPageData } from '@/lib/actions/dashboard-page'
import { HeroCommandBar } from '@/components/dashboard/HeroCommandBar'
import { HeatmapSection, HeatmapSectionSkeleton } from '@/components/dashboard/HeatmapSection'
import { NextMissionCard } from '@/components/dashboard/NextMissionCard'
import { FocusAreasCard } from '@/components/dashboard/FocusAreasCard'
import { ImprovedActivityFeed } from '@/components/dashboard/ImprovedActivityFeed'
import { DailyWikiCard } from '@/components/dashboard/FeatureDiscoveryRow'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'

export default async function DashboardPage() {
  const data = await getDashboardPageData()

  return (
    <SharedPageLayout>
    <div className="flex flex-col gap-2 w-full h-full min-h-0">

      {/* ── 1. Hero: Score + Greeting + Heatmap in one banner ────── */}
      <HeroCommandBar
        userName={data.userName}
        readinessScore={data.readinessScore}
        previousScore={data.previousScore}
        daysUntilExam={data.daysUntilExam}
        heroStats={data.heroStats}
        syllabusCoveragePercent={data.syllabusCoveragePercent}
      >
        <Suspense fallback={<HeatmapSectionSkeleton />}>
          <HeatmapSection />
        </Suspense>
      </HeroCommandBar>

      {/* ── 2. Content: 4-column grid ───────────────────────────── */}
      {/*   Col 1: Resume + Notes (stacked)                         */}
      {/*   Col 2: Today's Article (full height)                    */}
      {/*   Col 3: Focus Areas + 3D Lab (stacked)                  */}
      {/*   Col 4: Recent Activity (full height)                   */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-full flex-1 min-h-0">

        {/* Column 1: Today's Article + 3D Lab (full height) */}
        <div className="h-full">
          <DailyWikiCard article={data.dailyArticle} notes={data.recentNotes} />
        </div>

        {/* Column 2: Resume */}
        <div className="flex flex-col gap-2">
          <NextMissionCard action={data.action} />
        </div>

        {/* Column 3: Focus Areas */}
        <div className="flex flex-col gap-2">
          <FocusAreasCard areas={data.focusAreas} />
        </div>

        {/* Column 4: Recent Activity (full height) */}
        <div className="h-full">
          <ImprovedActivityFeed sessions={data.recentSessions} />
        </div>

      </div>

    </div>
    </SharedPageLayout>
  )
}
