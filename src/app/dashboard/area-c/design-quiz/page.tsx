import { getScenarios } from '@/lib/design-scenarios'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { ScenarioList } from './_components/ScenarioList'

export const metadata = { title: 'Design Quiz' }

const DesignQuizPage = async () => {
  const scenarios = await getScenarios()

  return (
    <SharedPageLayout>
      <div className='max-w-4xl mx-auto px-4 py-6 w-full'>
        <div className='mb-6'>
          <h1 className='text-xl font-semibold' style={{ color: '#1A2332' }}>
            Design Quiz
          </h1>
          <p className='mt-1 text-sm' style={{ color: '#4A5568' }}>
            Scenario-based computation questions. Each scenario shares a brief and site data — questions build on each other.
          </p>
        </div>

        <ScenarioList scenarios={scenarios} />
      </div>
    </SharedPageLayout>
  )
}

export default DesignQuizPage
