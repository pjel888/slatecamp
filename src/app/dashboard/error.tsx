'use client'

import RouteError from '@/components/shared/RouteError'
import { ROUTES } from '@/lib/routes'

export default function DashboardError({
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
      title="This section failed to load"
      message="Your progress data is safe. Try refreshing this section or return to the dashboard."
      backHref={ROUTES.dashboard.root}
      backLabel="Back to Dashboard"
      logTag="[DASHBOARD ERROR]"
    />
  )
}
