import { Suspense } from 'react'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { DailyCatalystCard } from '@/components/dashboard/DailyCatalystCard'
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard'
import { CompetenceSignalCard } from '@/components/dashboard/CompetenceSignalCard'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import { HeatmapSection, HeatmapSectionSkeleton } from '@/components/dashboard/HeatmapSection'
import { Card } from '@/components/ui/card'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { getDashboardData } from '@/lib/actions/dashboard'

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <SharedPageLayout>
      <div className='flex flex-col gap-2'>
        {/* 1. Grounding Layer */}
        <DashboardHero
          userName={data.userName}
          readinessMomentum={data.readinessMomentum}
        />

        {/* 2. Action Layer + Awareness Layer */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-2'>
          {/* Daily Catalyst — primary action, takes 2/3 width on desktop */}
          <div className='lg:col-span-2'>
            <DailyCatalystCard catalyst={data.catalyst} />
          </div>

          {/* Right column: Recent Activity */}
          <div className='lg:col-span-1'>
            <RecentActivityCard activities={data.recentActivities} />
          </div>
        </div>

        {/* 3. Competence Signals */}
        <CompetenceSignalCard
          totalAnswered={data.totalAnswered}
          topicsMastered={data.topicsMastered}
          readinessScore={data.readinessScore}
        />

        {/* 4. Consistency Layer */}
        <Card className='w-full relative p-2'>
          <RichInfoPopover
            title='Study Journey'
            description='Your activity over time. Each cell is one day — darker blue means more sessions completed.'
          />
          <Suspense fallback={<HeatmapSectionSkeleton />}>
            <HeatmapSection />
          </Suspense>
        </Card>
      </div>
    </SharedPageLayout>
  )
}
