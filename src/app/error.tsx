'use client'

import RouteError from '@/components/shared/RouteError'

export default function RootError({
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
      title="Something went wrong"
      message="An unexpected error occurred. Your study data is safe — this is a display error."
      logTag="[ROOT ERROR]"
    />
  )
}
