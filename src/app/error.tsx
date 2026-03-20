'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[ROOT ERROR]', error.message, error.digest)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-display text-2xl font-extrabold text-foreground">
        Something went wrong
      </h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        An unexpected error occurred. Your study data is safe — this is a display error.
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  )
}
