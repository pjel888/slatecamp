import { ReadinessScore } from '@/components/dashboard/ReadinessScore'
import {
  TaxonomyHeatmap,
  type HeatmapCluster,
} from '@/components/dashboard/TaxonomyHeatmap'
import { PacingEnduranceGauge } from '@/components/dashboard/PacingEnduranceGauge'
import { ActionQueues } from '@/components/dashboard/ActionQueues'
import { PredictiveRemediationCTA } from '@/components/dashboard/PredictiveRemediationCTA'
import { PersonalWorkspaceLink } from '@/components/dashboard/PersonalWorkspaceLink'

const DashboardPage = async () => {
  // TODO: Replace mocked values with real analytics wiring (EMA, IRT, pacing, taxonomy, queues).

  const readinessMock = {
    value: 68,
    trend: 'up' as const,
  }

  const pacingMock = {
    averageSecondsPerItem: 92,
    targetSecondsPerItem: 75,
    enduranceMinutes: 78,
    trend: 'improving' as const,
  }

  const proofUnlockedMock = false

  const taxonomyMock: HeatmapCluster[] = [
    {
      id: 'structural',
      title: 'Structural Design',
      nodes: [
        {
          id: 'steel',
          label: 'Steel Design Basics',
          state: 'familiar',
          progress: 72,
        },
        {
          id: 'rc',
          label: 'Reinforced Concrete',
          state: 'mastered',
          progress: 88,
        },
        {
          id: 'loads',
          label: 'Load Path & Framing',
          state: 'danger',
          progress: 41,
        },
      ],
    },
    {
      id: 'prof-practice',
      title: 'Professional Practice',
      nodes: [
        {
          id: 'contracts',
          label: 'Contracts & Deliverables',
          state: 'familiar',
          progress: 64,
        },
        {
          id: 'ethics',
          label: 'Ethics & Liability',
          state: 'unexplored',
          progress: 0,
        },
      ],
    },
  ]

  return (
    <div>
      <div className='w-full h-[256px] bg-red-50 mb-2'>
        <p>Image</p>
      </div>
      <div className='flex h-full flex-col gap-4 lg:flex-row lg:gap-6'>
        {/* Left column — macro mastery + taxonomy */}
        <div className='flex flex-1 flex-col gap-4'>
          <ReadinessScore
            value={readinessMock.value}
            trend={readinessMock.trend}
          />

          <div className='space-y-4'>
            <ActionQueues proofUnlocked={proofUnlockedMock} />
            <PredictiveRemediationCTA />
          </div>
        </div>

        {/* Right column — pacing, endurance, personal workspace */}
        <div className='flex flex-1 flex-col gap-4'>
          <TaxonomyHeatmap clusters={taxonomyMock} />
          <PacingEnduranceGauge
            averageSecondsPerItem={pacingMock.averageSecondsPerItem}
            targetSecondsPerItem={pacingMock.targetSecondsPerItem}
            enduranceMinutes={pacingMock.enduranceMinutes}
            trend={pacingMock.trend}
          />

          <PersonalWorkspaceLink />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
