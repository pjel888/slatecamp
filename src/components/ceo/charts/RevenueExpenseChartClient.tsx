'use client'

import dynamic from 'next/dynamic'
import { ChartSkeleton } from '@/components/ceo/skeletons/ChartSkeleton'

const RevenueExpenseChartLazy = dynamic(
  () =>
    import('@/components/ceo/RevenueExpenseChart').then((m) => ({
      default: m.RevenueExpenseChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton className="min-h-[300px]" /> },
)

interface RevenueExpenseChartClientProps {
  data: Array<{
    month: string
    revenue: number
    expenses: number
    net: number
  }>
}

export const RevenueExpenseChartClient = ({ data }: RevenueExpenseChartClientProps) => (
  <RevenueExpenseChartLazy data={data} />
)
