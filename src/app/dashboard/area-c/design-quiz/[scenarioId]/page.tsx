import { notFound } from 'next/navigation'
import { getScenarioById } from '@/lib/design-scenarios'
import { PracticeLayout } from '@/components/layouts/category/PracticeLayout'
import { DesignQuizSession } from '../_components/DesignQuizSession'

type PageProps = {
  params: Promise<{ scenarioId: string }>
}

export const generateMetadata = async ({ params }: PageProps) => {
  const { scenarioId } = await params
  const scenario = await getScenarioById(scenarioId)
  return { title: scenario ? `${scenario.title} — Design Quiz` : 'Design Quiz' }
}

const DesignQuizScenarioPage = async ({ params }: PageProps) => {
  const { scenarioId } = await params
  const scenario = await getScenarioById(scenarioId)

  if (!scenario) notFound()

  return (
    <PracticeLayout
      hero={{
        subtitle: scenario.title,
        description:
          'Answer scenario-based computation questions tied to a shared design brief.',
      }}
    >
      <DesignQuizSession scenario={scenario} />
    </PracticeLayout>
  )
}

export default DesignQuizScenarioPage
