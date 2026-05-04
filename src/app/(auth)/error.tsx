'use client'

import RouteError from '@/components/shared/RouteError'
import { ROUTES } from '@/lib/routes'

export default function AuthError({
  error,
  reset: _reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteError
      error={error}
      reset={_reset}
      title="Authentication error"
      message="Something went wrong during sign in."
      backHref={ROUTES.auth.login}
      backLabel="Return to login"
      logTag="[AUTH ERROR]"
    />
  )
}
