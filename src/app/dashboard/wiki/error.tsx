'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ROUTES } from '@/lib/routes'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function WikiError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[WIKI ERROR]', error.message, error.digest)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
      <h2 className="font-display text-xl font-extrabold text-foreground">
        Wiki failed to load
      </h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Something went wrong loading this wiki page. Try refreshing or return to the wiki home.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" size="sm">
          Retry
        </Button>
        <Link href={ROUTES.wiki.root}>
          <Button size="sm">Back to Wiki</Button>
        </Link>
      </div>
    </div>
  )
}
