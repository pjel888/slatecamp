import dynamic from 'next/dynamic'
import { getPacingAccuracyData } from '@/lib/actions/analytics/chart-data'

const PacingAccuracy = dynamic(
  () => import('@/components/analytics/PacingAccuracy').then(m => m.PacingAccuracy),
)

export const PacingAccuracySection = async () => {
  const result = await getPacingAccuracyData()
  if (result.error) throw new Error(result.error)
  return <PacingAccuracy data={result.data} />
}
