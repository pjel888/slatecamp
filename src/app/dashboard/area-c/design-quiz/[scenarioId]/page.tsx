import { notFound } from 'next/navigation'
import { getScenarioById } from '@/lib/design-scenarios'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { DesignQuizSession } from '../_components/DesignQuizSession'

type PageProps = {
  params: Promise<{ scenarioId: string }>
}

export const generateMetadata = async ({ params }: PageProps) => {
  const { scenarioId } = await params
  const scenario = getScenarioById(scenarioId)
  return { title: scenario ? `${scenario.title} — Design Quiz` : 'Design Quiz' }
}

const DesignQuizScenarioPage = async ({ params }: PageProps) => {
  const { scenarioId } = await params
  const scenario = getScenarioById(scenarioId)

  if (!scenario) notFound()

  return (
    <SharedPageLayout>
      <div className='max-w-6xl mx-auto px-4 py-6 w-full'>
        <DesignQuizSession scenario={scenario} />
      </div>
    </SharedPageLayout>
  )
}

export default DesignQuizScenarioPage
