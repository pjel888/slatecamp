import dynamic from 'next/dynamic'
import { getPacingAccuracyData } from '@/lib/actions/analytics/chart-data'

const PacingAccuracy = dynamic(
  () => import('@/components/analytics/PacingAccuracy').then(m => m.PacingAccuracy),
)

export const PacingAccuracySection = async () => {
  const data = await getPacingAccuracyData()
  return <PacingAccuracy data={data} />
}
