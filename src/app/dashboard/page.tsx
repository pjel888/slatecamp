import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap'
import { SubjectRadarChart } from '@/components/dashboard/SubjectRadarChart'
import {
  UnifiedReadinessCard,
  MetricSmall,
  PredictiveRemediationCard,
  ActionTall,
  PinnedRecentActivity,
  DailyCrucibleCard,
  PacingLeaksCard,
} from '@/components/dashboard/DashboardRightColumn'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { getSubjectMasteryData } from '@/lib/actions/mastery'

const DashboardPage = async () => {
  // TODO: Replace mocked values with real analytics wiring (EMA, IRT, pacing, taxonomy, queues).
  const masteryData = await getSubjectMasteryData()

  const readinessMock = {
    value: 68,
    trend: 'up' as const,
  }

  return (
    <SharedPageLayout>
      {/* Motivational Hero Section */}
      <DashboardHero userName='Philip' />

      {/* Temporal Anchor with System Engagement Info */}
      <div className='w-full max-h-[256px] bg-white mb-2 relative p-2 border border-zinc-200 rounded-sm'>
        <RichInfoPopover
          title='System Engagement'
          description='Consistency is tracked to measure study volume across the testing cycle.'
        />
        <ActivityHeatmap />
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-12 gap-2 items-stretch'>
        {/* Left Column (4/12) — The Diagnostic Stack */}
        <div className='xl:col-span-4 flex flex-col gap-2'>
          <UnifiedReadinessCard
            score={readinessMock.value}
            previousScore={62}
          />
          <div className='flex-1 flex flex-col'>
            <SubjectRadarChart data={masteryData} />
          </div>
        </div>

        {/* Middle Column (6/12) — The Action Center */}
        <div className='xl:col-span-6 flex flex-col gap-2'>
          {/* Metrics Row */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-2'>
            <MetricSmall
              iconName='timer'
              label='Avg Pacing'
              val='1.4'
              unit='Min / Q'
            />
            <MetricSmall
              iconName='calendar'
              label='Exam Goal'
              val='42'
              unit='Days Left'
            />
            <MetricSmall
              iconName='flame'
              label='Streak'
              val='12'
              unit='Days'
              color='orange'
            />
            <MetricSmall
              iconName='book'
              label='SRS Due'
              val='14'
              unit='Items'
              color='amber'
            />
          </div>

          {/* Remediation Gateway */}
          <PredictiveRemediationCard />

          {/* New Row: Daily Active Usage & Latency Benchmarks */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
            <DailyCrucibleCard />
            <PacingLeaksCard />
          </div>

          {/* Action Cycle Grid (Stretches to bottom) */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-2 flex-1'>
            <ActionTall
              iconName='alert'
              title='Blindspot Protocol'
              detail='Target weakest or avoided nodes.'
            />
            <ActionTall
              iconName='clock'
              title='Endurance Cycle'
              detail='Progressive stamina training.'
            />
            <ActionTall
              iconName='zap'
              title='Proof Simulation'
              detail='Full-fidelity exam rehearsal.'
            />
          </div>
        </div>

        {/* Right Column (2/12) — Momentum Feed */}
        <div className='xl:col-span-2 flex flex-col'>
          <PinnedRecentActivity />
        </div>
      </div>
    </SharedPageLayout>
  )
}

export default DashboardPage
