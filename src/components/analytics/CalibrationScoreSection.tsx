import { getCalibrationCurveData } from '@/lib/actions/analytics/get-calibration-data'
import { CalibrationScoreCard } from './CalibrationScoreCard'

export const CalibrationScoreSection = async () => {
  const data = await getCalibrationCurveData()
  return <CalibrationScoreCard data={data} />
}
