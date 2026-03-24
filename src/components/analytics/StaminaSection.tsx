import dynamic from 'next/dynamic'
import { getStaminaCurveData } from '@/lib/actions/analytics'

const StaminaCurve = dynamic(
  () => import('@/components/analytics/StaminaCurve').then(m => m.StaminaCurve),
)

export const StaminaSection = async () => {
  const data = await getStaminaCurveData()
  return <StaminaCurve data={data} />
}
