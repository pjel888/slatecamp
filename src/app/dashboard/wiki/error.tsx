'use client'

import RouteError from '@/components/shared/RouteError'
import { ROUTES } from '@/lib/routes'

export default function WikiError({
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
      title="Wiki failed to load"
      message="Something went wrong loading this wiki page. Try refreshing or return to the wiki home."
      backHref={ROUTES.wiki.root}
      backLabel="Back to Wiki"
      logTag="[WIKI ERROR]"
    />
  )
}
