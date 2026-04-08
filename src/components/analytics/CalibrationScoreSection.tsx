import dynamic from 'next/dynamic'
import { getCalibrationCurveData } from '@/lib/actions/analytics/get-calibration-data'

const CalibrationScoreCard = dynamic(
  () => import('@/components/analytics/CalibrationScoreCard').then(m => m.CalibrationScoreCard),
)

export const CalibrationScoreSection = async () => {
  const result = await getCalibrationCurveData()
  if (result.error) throw new Error(result.error)
  return <CalibrationScoreCard data={result.data} />
}
