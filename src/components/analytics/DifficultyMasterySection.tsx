import dynamic from 'next/dynamic'
import { getDifficultyMasteryData } from '@/lib/actions/analytics/chart-data'

const DifficultyMasteryScatter = dynamic(
  () => import('@/components/analytics/DifficultyMasteryScatter').then(m => m.DifficultyMasteryScatter),
)

export const DifficultyMasterySection = async () => {
  const data = await getDifficultyMasteryData()
  return <DifficultyMasteryScatter data={data} />
}
