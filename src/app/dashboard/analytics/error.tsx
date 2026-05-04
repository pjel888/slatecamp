'use client'

import { AlertTriangle } from 'lucide-react'
import RouteError from '@/components/shared/RouteError'

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="Something went wrong loading analytics"
      message={error.message || 'An unexpected error occurred while loading your analytics data.'}
      variant="card"
      icon={<AlertTriangle className="w-8 h-8 text-muted-foreground/60" />}
    />
  )
}
