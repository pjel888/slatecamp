import dynamic from 'next/dynamic'
import { getForgettingCurveData } from '@/lib/actions/analytics/chart-data'

const ForgettingCurves = dynamic(
  () => import('@/components/analytics/ForgettingCurves').then(m => m.ForgettingCurves),
)

export const ForgettingCurvesSection = async () => {
  const result = await getForgettingCurveData()
  if (result.error) throw new Error(result.error)
  return <ForgettingCurves data={result.data} />
}
