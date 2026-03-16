import { ReadinessScore } from '@/components/dashboard/ReadinessScore'
import { ActionQueues } from '@/components/dashboard/ActionQueues'
import { PredictiveRemediationCTA } from '@/components/dashboard/PredictiveRemediationCTA'
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap'
import { SubjectRadarChart } from '@/components/dashboard/SubjectRadarChart'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { getSubjectMasteryData } from '@/lib/actions/mastery'

const DashboardPage = async () => {
  // TODO: Replace mocked values with real analytics wiring (EMA, IRT, pacing, taxonomy, queues).
  const masteryData = await getSubjectMasteryData()

  const readinessMock = {
    value: 68,
    trend: 'up' as const,
  }

  const proofUnlockedMock = false

  return (
    <SharedPageLayout>
      <div className='w-full max-h-[256px] bg-white mb-2' id='github-grid'>
        <ActivityHeatmap />
      </div>
      <div className='flex h-full  gap-2 flex-row'>
        {/* Left column — macro mastery + taxonomy */}
        <div className='flex flex-1 flex-col gap-2'>
          <ReadinessScore
            score={readinessMock.value}
            previousScore={62} // Mocking a previous score to maintain the 'up' trend
          />
          <SubjectRadarChart data={masteryData} />
        </div>

        {/* Right column — pacing, endurance, personal workspace */}
        <div className='flex flex-1 flex-col gap-2'>
          {' '}
          <div className='space-y-2'>
            <ActionQueues proofUnlocked={proofUnlockedMock} />
            <PredictiveRemediationCTA />
          </div>
        </div>
      </div>

      {/* <PHBuildingSetbacks /> */}
    </SharedPageLayout>
  )
}

export default DashboardPage
