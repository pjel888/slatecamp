import { getPacingQuadrantData } from '@/lib/actions/analytics'
import { PacingQuadrant } from '@/components/analytics/PacingQuadrant'

export async function PacingQuadrantSection() {
  const data = await getPacingQuadrantData()
  return <PacingQuadrant data={data} targetTimeMs={120_000} passingAccuracy={75} />
}
