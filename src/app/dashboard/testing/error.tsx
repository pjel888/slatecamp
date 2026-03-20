'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const TestingError = ({ error, reset }: ErrorProps) => {
  useEffect(() => {
    console.error('[QUIZ ERROR]', error.message, error.digest)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
      <h2 className="font-display text-xl font-extrabold text-foreground">
        Your quiz session encountered an issue
      </h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Your answers have been auto-saved. You can retry or return to testing.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" size="sm">
          Retry
        </Button>
        <Link href="/dashboard/testing">
          <Button size="sm">Back to Testing</Button>
        </Link>
      </div>
    </div>
  )
}

export default TestingError
