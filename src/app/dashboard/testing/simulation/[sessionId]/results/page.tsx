import { redirect } from 'next/navigation'

interface SimulationResultsPageProps {
  params: Promise<{ sessionId: string }>
}

const SimulationResultsPage = async ({ params }: SimulationResultsPageProps) => {
  const { sessionId } = await params
  redirect(`/quiz/fullexam/session/${sessionId}/results`)
}

export default SimulationResultsPage
