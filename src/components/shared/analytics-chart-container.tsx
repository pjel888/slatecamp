import * as React from 'react'
import { Suspense } from 'react'
import { ChartSkeleton } from '@/components/analytics/ChartSkeleton'
import { AnalyticsErrorBoundary } from '@/components/analytics/AnalyticsErrorBoundary'

interface AnalyticsChartContainerProps {
  children?: React.ReactNode
  fallbackHeight?: string
  skeletonType?: 'bar' | 'line' | 'table' | 'generic'
  /** Optional key for Suspense to force re-render on dependency change */
  suspenseKey?: string
}

/**
 * A standardized wrapper for analytics charts that handles:
 * - Suspense with a themed skeleton
 * - Error boundary with retry logic
 * - Consistent height and layout constraints
 */
export const AnalyticsChartContainer = ({
  children,
  fallbackHeight = 'h-[200px]',
  skeletonType = 'generic',
  suspenseKey,
}: AnalyticsChartContainerProps) => {
  return (
    <Suspense 
      key={suspenseKey} 
      fallback={<ChartSkeleton height={fallbackHeight} type={skeletonType} />}
    >
      <AnalyticsErrorBoundary fallbackHeight={fallbackHeight}>
        {children}
      </AnalyticsErrorBoundary>
    </Suspense>
  )
}
