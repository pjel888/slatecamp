import dynamic from 'next/dynamic'
import { getStaminaCurveData } from '@/lib/actions/analytics'

const StaminaCurve = dynamic(
  () => import('@/components/analytics/StaminaCurve').then(m => m.StaminaCurve),
)

export const StaminaSection = async () => {
  const result = await getStaminaCurveData()
  if (result.error) throw new Error(result.error)
  return <StaminaCurve data={result.data} />
}
