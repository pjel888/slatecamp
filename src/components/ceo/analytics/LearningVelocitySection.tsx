import dynamic from 'next/dynamic'
import { getLearningVelocityData } from '@/lib/queries/ceo/analytics/get-learning-velocity'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const LearningVelocity = dynamic(
  () =>
    import('@/components/ceo/analytics/LearningVelocity').then((m) => m.LearningVelocity),
)

export const LearningVelocitySection = async () => {
  const result = await getLearningVelocityData()
  if (result.error) throw new Error(result.error)

  if (!result.data.length) {
    return (
      <ChartEmptyState
        title="No mastery data yet"
        description="Learning velocity metrics appear as users achieve topic mastery."
        height="h-[320px]"
      />
    )
  }

  return <LearningVelocity data={result.data} />
}
