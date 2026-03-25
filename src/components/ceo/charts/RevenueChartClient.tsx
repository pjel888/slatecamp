'use client'

import dynamic from 'next/dynamic'
import { ChartSkeleton } from '@/components/ceo/skeletons/ChartSkeleton'
import type { RevenueBreakdown } from '@/types/ceo'

const RevenueChartLazy = dynamic(
  () => import('@/components/ceo/RevenueChart').then((m) => ({ default: m.RevenueChart })),
  { ssr: false, loading: () => <ChartSkeleton className="min-h-[320px]" /> },
)

export const RevenueChartClient = ({ data }: { data: RevenueBreakdown[] }) => (
  <RevenueChartLazy data={data} />
)
