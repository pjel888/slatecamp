import { getConfidenceCalibration } from '@/lib/actions/analytics-data'
import { ConfidenceCalibration } from './ConfidenceCalibration'

export const ConfidenceCalibrationSection = async () => {
  const data = await getConfidenceCalibration()
  return <ConfidenceCalibration data={data} />
}
