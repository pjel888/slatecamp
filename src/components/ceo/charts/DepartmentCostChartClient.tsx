'use client'

import dynamic from 'next/dynamic'
import { ChartSkeleton } from '@/components/ceo/skeletons/ChartSkeleton'
import type { DepartmentCost } from '@/types/ceo'

const DepartmentCostChartLazy = dynamic(
  () =>
    import('@/components/ceo/DepartmentCostChart').then((m) => ({
      default: m.DepartmentCostChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton className="min-h-[280px]" /> },
)

export const DepartmentCostChartClient = ({ data }: { data: DepartmentCost[] }) => (
  <DepartmentCostChartLazy data={data} />
)
