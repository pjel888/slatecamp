import { getErrorPatterns } from '@/lib/actions/analytics/get-error-patterns'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import { ErrorPatterns } from './ErrorPatterns'

export const ErrorPatternsSection = async () => {
  const result = await getErrorPatterns()
  if (result.error) throw new Error(result.error)
  const data = result.data

  if (!data || data.totalClassified === 0) {
    return (
      <ChartEmptyState
        title="No error data yet"
        description="Answer questions incorrectly to see your error pattern breakdown here."
        height="h-[320px]"
      />
    )
  }

  return (
    <ErrorPatterns
      categoryCounts={data.categoryCounts}
      totalClassified={data.totalClassified}
    />
  )
}
