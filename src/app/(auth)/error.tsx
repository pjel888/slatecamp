'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/lib/routes'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AuthError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[AUTH ERROR]', error.message)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="font-display text-xl font-extrabold">Authentication error</h2>
      <p className="text-sm text-muted-foreground">
        Something went wrong during sign in.
      </p>
      <Link href={ROUTES.auth.login} className="text-sm text-primary underline underline-offset-4">
        Return to login
      </Link>
    </div>
  )
}
