import dynamic from 'next/dynamic'
import { getStudyCohortsData } from '@/lib/queries/ceo/analytics/get-study-cohorts'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const StudyCohort = dynamic(
  () => import('@/components/ceo/analytics/StudyCohort').then((m) => m.StudyCohort),
)

export const StudyCohortSection = async () => {
  const result = await getStudyCohortsData()
  if (result.error) throw new Error(result.error)

  const cohorts = result.data

  if (cohorts.length === 0) {
    return (
      <ChartEmptyState
        title="No cohort data yet"
        description="Study cohort analysis appears after multiple users have study history."
        height="h-[320px]"
      />
    )
  }

  return <StudyCohort cohorts={cohorts} />
}
