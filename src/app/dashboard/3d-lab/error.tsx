'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ROUTES } from '@/lib/routes'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const ThreeDLabError = ({ error, reset }: ErrorProps) => {
  useEffect(() => {
    console.error('[3D LAB ERROR]', error.message, error.digest)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
      <h2 className="font-display text-xl font-extrabold text-foreground">
        The 3D Lab couldn&apos;t load
      </h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        This may be a graphics compatibility issue. Try refreshing or return to
        the dashboard.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" size="sm">
          Retry
        </Button>
        <Link href={ROUTES.dashboard.root}>
          <Button size="sm">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}

export default ThreeDLabError
