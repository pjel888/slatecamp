import dynamic from 'next/dynamic'
import { getPacingQuadrantData } from '@/lib/actions/analytics'

const PacingQuadrant = dynamic(
  () => import('@/components/analytics/PacingQuadrant').then(m => m.PacingQuadrant),
)

export const PacingQuadrantSection = async () => {
  const result = await getPacingQuadrantData()
  if (result.error) throw new Error(result.error)
  return <PacingQuadrant data={result.data} targetTimeMs={120_000} passingAccuracy={75} />
}
