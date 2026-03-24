import dynamic from 'next/dynamic'
import { getPacingQuadrantData } from '@/lib/actions/analytics'

const PacingQuadrant = dynamic(
  () => import('@/components/analytics/PacingQuadrant').then(m => m.PacingQuadrant),
)

export const PacingQuadrantSection = async () => {
  const data = await getPacingQuadrantData()
  return <PacingQuadrant data={data} targetTimeMs={120_000} passingAccuracy={75} />
}
