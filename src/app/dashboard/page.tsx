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
  // Restore real mastery data fetching
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

      {/* Main Layout Grid (12 Columns) */}
      <div className='grid grid-cols-1 xl:grid-cols-12 gap-2 items-stretch'>
        
        {/* Left + Middle: Explicit Dual-Row Architecture */}
        <div className='xl:col-span-10 flex flex-col gap-2'>
          
          {/* ROW 1: Forces an unbreakable horizontal alignment line at the bottom of these cards */}
          <div className='grid grid-cols-1 xl:grid-cols-10 gap-2 items-stretch'>
            {/* Top Left: Readiness */}
            <div className='xl:col-span-4 flex flex-col'>
              <div className='flex-1 w-full'>
                <UnifiedReadinessCard
                  score={readinessMock.value}
                  previousScore={62}
                />
              </div>
            </div>

            {/* Top Right: Metrics + Remediation */}
            <div className='xl:col-span-6 flex flex-col gap-2'>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-2'>
                <MetricSmall iconName='timer' label='Avg Pacing' val='1.4' unit='Min / Q' />
                <MetricSmall iconName='calendar' label='Exam Goal' val='42' unit='Days Left' />
                <MetricSmall iconName='flame' label='Streak' val='12' unit='Days' color='orange' />
                <MetricSmall iconName='book' label='SRS Due' val='14' unit='Items' color='amber' />
              </div>
              <div className='flex-1 w-full'>
                <PredictiveRemediationCard />
              </div>
            </div>
          </div>

          {/* ROW 2: Bottom section, forces alignment to the floor */}
          <div className='grid grid-cols-1 xl:grid-cols-10 gap-2 items-stretch flex-1'>
            {/* Bottom Left: Radar Chart */}
            <div className='xl:col-span-4 flex flex-col'>
              <div className='flex-1 w-full'>
                <SubjectRadarChart data={masteryData} />
              </div>
            </div>

            {/* Bottom Right: Micro-Diagnostics + Action Cards */}
            <div className='xl:col-span-6 flex flex-col gap-2'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                <DailyCrucibleCard />
                <PacingLeaksCard />
              </div>
              <div className='flex-1 grid grid-cols-1 md:grid-cols-3 gap-2'>
                <ActionTall iconName='alert' title='Blindspot Protocol' detail='Target weakest or avoided nodes.' />
                <ActionTall iconName='clock' title='Endurance Cycle' detail='Progressive stamina training.' />
                <ActionTall iconName='zap' title='Proof Simulation' detail='Full-fidelity exam rehearsal.' />
              </div>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN: Momentum Feed (2/12) */}
        <div className='xl:col-span-2 flex flex-col gap-2'>
          <PinnedRecentActivity />
        </div>

      </div>
    </SharedPageLayout>
  )
}

export default DashboardPage
