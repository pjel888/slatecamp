'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[DASHBOARD ERROR]', error.message, error.digest)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
      <h2 className="font-display text-xl font-extrabold text-foreground">
        This section failed to load
      </h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Your progress data is safe. Try refreshing this section or return to the dashboard.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" size="sm">
          Retry
        </Button>
        <Link href="/dashboard">
          <Button size="sm">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
