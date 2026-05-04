'use client'

import { useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RouteErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  /** Error title displayed as the heading */
  title?: string
  /** Descriptive message shown below the title */
  message?: string
  /** If provided, renders a secondary "Back to X" link beside the reset button */
  backHref?: string
  backLabel?: string
  /** Log tag used in console.error, e.g. '[ROOT ERROR]' */
  logTag?: string
  /** Optional icon rendered above the heading */
  icon?: ReactNode
  /** Layout variant: 'default' (flex center), 'card' (Card wrapper) */
  variant?: 'default' | 'card'
}

// ─── Component ─────────────────────────────────────────────────────────────

const RouteError = ({
  error,
  reset,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Your data is safe — try refreshing.',
  backHref,
  backLabel,
  logTag = '[ERROR]',
  icon,
  variant = 'default',
}: RouteErrorProps) => {
  useEffect(() => {
    console.error(logTag, error.message, error.digest)
  }, [error, logTag])

  const actions = (
    <div className="flex gap-3">
      <Button onClick={reset} variant="outline" size="sm">
        Try again
      </Button>
      {backHref && (
        <Link href={backHref}>
          <Button size="sm">{backLabel ?? 'Go back'}</Button>
        </Link>
      )}
    </div>
  )

  if (variant === 'card') {
    return (
      <div className="max-w-lg mx-auto py-16">
        <Card className="text-center p-8">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-0">
            {icon}
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                {error.message || message}
              </p>
              {error.digest && (
                <p className="font-mono text-[11px] text-text-tertiary mt-1">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            {actions}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
      {icon}
      <div className="text-center">
        <h2 className="font-display text-xl font-extrabold text-foreground">
          {title}
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground mt-1">
          {error.message || message}
        </p>
        {error.digest && (
          <p className="font-mono text-[11px] text-text-tertiary mt-1">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      {actions}
    </div>
  )
}

export default RouteError
