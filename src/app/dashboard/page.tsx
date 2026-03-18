import { Suspense } from 'react'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { DailyCatalystCard } from '@/components/dashboard/DailyCatalystCard'
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard'
import { CompetenceSignalCard } from '@/components/dashboard/CompetenceSignalCard'
import { ReadinessScore } from '@/components/dashboard/ReadinessScore'
import { SubjectMasteryBars } from '@/components/dashboard/SubjectMasteryBars'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import { HeatmapSection, HeatmapSectionSkeleton } from '@/components/dashboard/HeatmapSection'
import { Card } from '@/components/ui/card'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { getDashboardData } from '@/lib/actions/dashboard'

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <SharedPageLayout>
      <div className='flex flex-col gap-2 xl:gap-3'>
        {/* 1. Grounding Layer */}
        <DashboardHero
          userName={data.userName}
          readinessMomentum={data.readinessMomentum}
        />

        {/* 2. Primary Action — full width */}
        <DailyCatalystCard catalyst={data.catalyst} />

        {/* 3. Readiness Score + Quick Stats */}
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-2'>
          <div className='lg:col-span-3'>
            <ReadinessScore
              score={data.readinessScore}
              previousScore={data.previousReadinessScore}
            />
          </div>
          <div className='lg:col-span-2'>
            <CompetenceSignalCard
              totalAnswered={data.totalAnswered}
              topicsMastered={data.topicsMastered}
              studyDaysCount={data.studyDaysCount}
            />
          </div>
        </div>

        {/* 4. Subject Mastery Bars */}
        <SubjectMasteryBars subjects={data.subjectMastery} />

        {/* 5. Consistency + Recent Activity — cream section break */}
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-2 bg-[#F2F0EB] rounded-md p-2 xl:p-3'>
          <div className='lg:col-span-3'>
            <Card className='w-full relative p-2 bg-white h-full flex flex-col'>
              <p className='font-dm-mono text-[11px] font-medium text-[#8896A7] uppercase tracking-[0.2em] mb-2 px-1 pt-1'>
                Consistency
              </p>
              <RichInfoPopover
                title='Study Journey'
                description='Your progress over time. Each cell is one day — deeper blue means more sessions completed that day.'
              />
              <Suspense fallback={<HeatmapSectionSkeleton />}>
                <HeatmapSection />
              </Suspense>
            </Card>
          </div>
          <div className='lg:col-span-2 h-full'>
            <RecentActivityCard activities={data.recentActivities} />
          </div>
        </div>
      </div>
    </SharedPageLayout>
  )
}
