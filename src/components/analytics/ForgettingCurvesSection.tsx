import dynamic from 'next/dynamic'
import { getForgettingCurveData } from '@/lib/actions/analytics/chart-data'

const ForgettingCurves = dynamic(
  () => import('@/components/analytics/ForgettingCurves').then(m => m.ForgettingCurves),
)

export const ForgettingCurvesSection = async () => {
  const data = await getForgettingCurveData()
  return <ForgettingCurves data={data} />
}
