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
        <div className='min-h-0'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-full'>
            {/* Spanning card across columns 1-3 */}
            <div className='lg:col-span-3 rounded-md border border-[#D4DAE3] bg-white p-2'>
              <div className='grid grid-cols-3 gap-2 h-full'>
                <div className='rounded-md bg-[#EEF2FC] min-h-[72px]' />
                <div className='rounded-md bg-[#EDFAF4] min-h-[72px]' />
                <div className='rounded-md bg-[#FEF8ED] min-h-[72px]' />
              </div>
            </div>

            {/* Column 4: Recent Activity (spans both rows) */}
            <div className='h-full lg:row-span-2'>
              <ImprovedActivityFeed sessions={data.recentSessions} />
            </div>

            {/* Column 1: Today's Article */}
            <div className='h-full'>
              <DailyWikiCard
                article={data.dailyArticle}
                notes={data.recentNotes}
              />
            </div>

            {/* Column 2: Reserved */}
            <div />

            {/* Column 3: Subject Mastery (radar chart + progress bars) */}
            <div className='h-full'>
              <SubjectMasteryCard data={data.subjectMastery} />
            </div>
          </div>
        </div>
      </div>
    </SharedPageLayout>
  )
}
