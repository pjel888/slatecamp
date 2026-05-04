'use client'

import { Warning } from '@phosphor-icons/react/dist/ssr'
import RouteError from '@/components/shared/RouteError'

export default function DeveloperPortalError({
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
      message={error.message || 'An unexpected error occurred in the Developer Portal.'}
      logTag="[Developer Portal Error]"
      variant="card"
      icon={<Warning size={32} className="text-amber-500 mx-auto" />}
    />
  )
}
