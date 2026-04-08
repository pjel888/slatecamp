import dynamic from 'next/dynamic'
import { getMemoryHealthData } from '@/lib/actions/analytics'

const MemoryHealthMap = dynamic(
  () => import('@/components/analytics/MemoryHealthMap').then(m => m.MemoryHealthMap),
)

export const MemorySection = async () => {
  const result = await getMemoryHealthData()
  if (result.error) throw new Error(result.error)
  return <MemoryHealthMap data={result.data} />
}
