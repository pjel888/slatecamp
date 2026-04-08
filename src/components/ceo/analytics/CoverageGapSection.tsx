import dynamic from 'next/dynamic'
import { getCoverageGapData } from '@/lib/queries/ceo/analytics/get-coverage-gap'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const CoverageGap = dynamic(
  () => import('@/components/ceo/analytics/CoverageGap').then((m) => m.CoverageGap),
)

export const CoverageGapSection = async () => {
  const result = await getCoverageGapData()
  if (result.error) throw new Error(result.error)

  if (result.data.length === 0) {
    return (
      <ChartEmptyState
        title="No coverage data yet"
        description="Coverage gap analysis appears as users study across topics."
        height="h-[320px]"
      />
    )
  }

  return <CoverageGap data={result.data} />
}
