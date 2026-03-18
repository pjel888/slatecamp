import { getMemoryHealthData } from '@/lib/actions/analytics'
import { MemoryHealthMap } from '@/components/analytics/MemoryHealthMap'

export async function MemorySection() {
  const data = await getMemoryHealthData()
  return <MemoryHealthMap data={data} />
}
