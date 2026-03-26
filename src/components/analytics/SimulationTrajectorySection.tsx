import dynamic from 'next/dynamic'
import { getSimulationTrajectory } from '@/lib/actions/progress-report/actions'

const SimulationTrajectory = dynamic(
  () => import('@/components/analytics/SimulationTrajectory').then((m) => m.SimulationTrajectory),
)

export const SimulationTrajectorySection = async () => {
  const data = await getSimulationTrajectory()
  return <SimulationTrajectory data={data} />
}
