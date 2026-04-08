import dynamic from 'next/dynamic'
import { getQuestionHealthData } from '@/lib/queries/ceo/analytics/get-question-health'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const QuestionHealth = dynamic(
  () => import('@/components/ceo/analytics/QuestionHealth').then((m) => m.QuestionHealth),
)

export const QuestionHealthSection = async () => {
  const result = await getQuestionHealthData()
  if (result.error) throw new Error(result.error)

  const questions = result.data

  if (questions.length === 0) {
    return (
      <ChartEmptyState
        title="No flagged questions yet"
        description="Question health analysis needs sufficient answer data across questions."
        height="h-[400px]"
      />
    )
  }

  return <QuestionHealth questions={questions} />
}
