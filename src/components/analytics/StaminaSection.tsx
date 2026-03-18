import { getStaminaCurveData } from '@/lib/actions/analytics'
import { StaminaCurve } from '@/components/analytics/StaminaCurve'

export async function StaminaSection() {
  const data = await getStaminaCurveData()
  return <StaminaCurve data={data} />
}
