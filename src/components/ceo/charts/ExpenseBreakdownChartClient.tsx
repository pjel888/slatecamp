'use client'

import dynamic from 'next/dynamic'
import { ChartSkeleton } from '@/components/ceo/skeletons/ChartSkeleton'

const ExpenseBreakdownChartLazy = dynamic(
  () =>
    import('@/components/ceo/ExpenseBreakdownChart').then((m) => ({
      default: m.ExpenseBreakdownChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton className="min-h-[280px]" /> },
)

interface ExpenseBreakdownChartClientProps {
  data: Array<{
    category: string
    amount: number
    label: string
  }>
}

export const ExpenseBreakdownChartClient = ({ data }: ExpenseBreakdownChartClientProps) => (
  <ExpenseBreakdownChartLazy data={data} />
)
