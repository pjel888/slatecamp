import { ActionQueues } from '@/components/dashboard/ActionQueues'
import { PacingEnduranceGauge } from '@/components/dashboard/PacingEnduranceGauge'
import { PersonalWorkspaceLink } from '@/components/dashboard/PersonalWorkspaceLink'
import { PredictiveRemediationCTA } from '@/components/dashboard/PredictiveRemediationCTA'
import { ReadinessScore } from '@/components/dashboard/ReadinessScore'
import {
  HeatmapCluster,
  TaxonomyHeatmap,
} from '@/components/dashboard/TaxonomyHeatmap'
import React from 'react'

const AnalyticsPage = () => {
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
          {' '}
          <TaxonomyHeatmap clusters={taxonomyMock} />
        </div>

        {/* Right column — pacing, endurance, personal workspace */}
        <div className='flex flex-1 flex-col gap-4'>
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

export default AnalyticsPage
