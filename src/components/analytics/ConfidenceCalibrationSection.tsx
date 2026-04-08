import dynamic from 'next/dynamic'
import { getConfidenceCalibration } from '@/lib/actions/analytics-data'

const ConfidenceCalibration = dynamic(
  () => import('@/components/analytics/ConfidenceCalibration').then(m => m.ConfidenceCalibration),
)

export const ConfidenceCalibrationSection = async () => {
  const result = await getConfidenceCalibration()
  if (result.error) throw new Error(result.error)
  return <ConfidenceCalibration data={result.data} />
}
