import { ReadinessScore } from '@/components/dashboard/ReadinessScore'
import { ActionQueues } from '@/components/dashboard/ActionQueues'
import { PredictiveRemediationCTA } from '@/components/dashboard/PredictiveRemediationCTA'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'

const DashboardPage = async () => {
  // TODO: Replace mocked values with real analytics wiring (EMA, IRT, pacing, taxonomy, queues).

  const readinessMock = {
    value: 68,
    trend: 'up' as const,
  }

  const proofUnlockedMock = false

  return (
    <SharedPageLayout>
      <div className='w-full h-[256px] bg-white mb-2'>
        {/* <GradientImage /> */}
        <p>Image</p>
      </div>
      <div className='flex h-full  gap-2 flex-row'>
        {/* Left column — macro mastery + taxonomy */}
        <div className='flex flex-1 flex-col gap-2'>
          <ReadinessScore
            value={readinessMock.value}
            trend={readinessMock.trend}
          />
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
    </SharedPageLayout>
  )
}

export default DashboardPage
