'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Warning } from '@phosphor-icons/react'

export default function DeveloperPortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Developer Portal Error]', error)
  }, [error])

  return (
    <div className="max-w-lg mx-auto py-16">
      <Card className="text-center p-8">
        <Warning size={32} className="text-amber-500 mx-auto mb-3" />
        <h2 className="font-[family-name:var(--font-display)] font-bold text-lg text-foreground mb-1">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message || 'An unexpected error occurred in the Developer Portal.'}
        </p>
        {error.digest && (
          <p className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground mb-4">
            Error ID: {error.digest}
          </p>
        )}
        <Button variant="primary" size="sm" onClick={reset}>
          Try Again
        </Button>
      </Card>
    </div>
  )
}
