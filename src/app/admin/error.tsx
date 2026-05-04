'use client'

import { Warning } from '@phosphor-icons/react/dist/ssr'
import RouteError from '@/components/shared/RouteError'
import { ROUTES } from '@/lib/routes'

export default function AdminError({
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
      message={error.message || 'An unexpected error occurred in the admin area.'}
      backHref={ROUTES.admin.root}
      backLabel="Back to Admin"
      logTag="[ADMIN ERROR]"
      variant="default"
      icon={
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <Warning size={24} className="text-destructive" />
        </div>
      }
    />
  )
}
