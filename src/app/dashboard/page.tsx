import { Suspense } from 'react'
import { getDashboardPageData } from '@/lib/actions/dashboard-page'
import { HeroCommandBar } from '@/components/dashboard/HeroCommandBar'
import {
  HeatmapSection,
  HeatmapSectionSkeleton,
} from '@/components/dashboard/HeatmapSection'
import { SubjectMasteryCard } from '@/components/dashboard/SubjectMasteryCard'
import { ImprovedActivityFeed } from '@/components/dashboard/ImprovedActivityFeed'
import { DailyWikiCard } from '@/components/dashboard/FeatureDiscoveryRow'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'

export default async function DashboardPage() {
  const data = await getDashboardPageData()

  return (
    <SharedPageLayout>
      <div className='flex flex-col gap-2 w-full h-full min-h-0 border-0'>
        {/* ── 1. Hero: Score + Greeting + Heatmap ────────────────── */}
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

        {/* ── 2. Content: 4-column grid (scrolls when needed) ──── */}
        <div className='flex-1 min-h-0 overflow-y-auto'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-full min-h-[560px] h-full'>
            {/* Column 1: Today's Article */}
            <div className='h-full'>
              <DailyWikiCard
                article={data.dailyArticle}
                notes={data.recentNotes}
              />
            </div>

            {/* Column 2: Subject Mastery (radar chart + progress bars) */}
            <div className='h-full'>
              <SubjectMasteryCard data={data.subjectMastery} />
            </div>

            {/* Column 3: Reserved */}
            <div />

            {/* Column 4: Recent Activity */}
            <div className='h-full'>
              <ImprovedActivityFeed sessions={data.recentSessions} />
            </div>
          </div>
        </div>
      </div>
    </SharedPageLayout>
  )
}
