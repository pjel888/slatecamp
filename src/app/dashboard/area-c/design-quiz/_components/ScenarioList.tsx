import type { DesignScenario } from '@/lib/design-scenarios'
import { ScenarioCard } from './ScenarioCard'

type ScenarioListProps = {
  scenarios: DesignScenario[]
}

export const ScenarioList = ({ scenarios }: ScenarioListProps) => {
  if (scenarios.length === 0) {
    return (
      <div className='rounded-md border border-[#D4DAE3] bg-white px-4 py-8 text-center'>
        <p className='text-sm text-[#8896A7]'>No scenarios available.</p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
      {scenarios.map((scenario) => (
        <ScenarioCard key={scenario.id} scenario={scenario} />
      ))}
    </div>
  )
}
