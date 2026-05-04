'use client'

import RouteError from '@/components/shared/RouteError'
import { ROUTES } from '@/lib/routes'

export default function ThreeDLabError({
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
      title="The 3D Lab couldn't load"
      message="This may be a graphics compatibility issue. Try refreshing or return to the dashboard."
      backHref={ROUTES.dashboard.root}
      backLabel="Back to Dashboard"
      logTag="[3D LAB ERROR]"
    />
  )
}
