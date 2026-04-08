import dynamic from 'next/dynamic'
import { getDifficultyMasteryData } from '@/lib/actions/analytics/chart-data'

const DifficultyMasteryScatter = dynamic(
  () => import('@/components/analytics/DifficultyMasteryScatter').then(m => m.DifficultyMasteryScatter),
)

export const DifficultyMasterySection = async () => {
  const result = await getDifficultyMasteryData()
  if (result.error) throw new Error(result.error)
  return <DifficultyMasteryScatter data={result.data} />
}
