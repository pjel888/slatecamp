import { ReadinessScore } from '@/components/dashboard/ReadinessScore'
import {
  TaxonomyHeatmap,
  type HeatmapCluster,
} from '@/components/dashboard/TaxonomyHeatmap'
import { PacingEnduranceGauge } from '@/components/dashboard/PacingEnduranceGauge'
import { ActionQueues } from '@/components/dashboard/ActionQueues'
import { PredictiveRemediationCTA } from '@/components/dashboard/PredictiveRemediationCTA'
import { PersonalWorkspaceLink } from '@/components/dashboard/PersonalWorkspaceLink'
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
      <div className='w-full h-[256px] bg-red-50 mb-2'>
        <p>Image</p>
      </div>
      <div className='flex h-full flex-col gap-2 lg:flex-row lg:gap-6'>
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
