import { Suspense } from 'react'
import { getDashboardPageData } from '@/lib/actions/dashboard-page'
import { HeroCommandBar } from '@/components/dashboard/HeroCommandBar'
import { HeatmapSection, HeatmapSectionSkeleton } from '@/components/dashboard/HeatmapSection'
import { NextMissionCard } from '@/components/dashboard/NextMissionCard'
import { FocusAreasCard } from '@/components/dashboard/FocusAreasCard'
import { ImprovedActivityFeed } from '@/components/dashboard/ImprovedActivityFeed'
import { DailyWikiCard, LabPreviewCard, RecentNotesCard } from '@/components/dashboard/FeatureDiscoveryRow'

export default async function DashboardPage() {
  const data = await getDashboardPageData()

  return (
    <div className="relative h-full w-full">
      {/* Dotted grid background */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(24,24,27,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-2 p-2 w-full">

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

        {/* ── 2. Action cards row ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full">
          <NextMissionCard action={data.action} />
          <FocusAreasCard areas={data.focusAreas} />
          <ImprovedActivityFeed sessions={data.recentSessions} />
        </div>

        {/* ── 3. Feature Discovery Row ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
          <DailyWikiCard article={data.dailyArticle} />
          <LabPreviewCard moduleCount={data.labModuleCount} />
          <RecentNotesCard notes={data.recentNotes} />
        </div>

      </div>
    </div>
  )
}
