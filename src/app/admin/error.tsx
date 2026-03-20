'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const AdminError = ({ error, reset }: ErrorProps) => {
  useEffect(() => {
    console.error('[ADMIN ERROR]', error.message, error.digest)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
      <h2 className="font-display text-xl font-extrabold text-foreground">
        Admin panel error
      </h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Something went wrong in the admin area.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" size="sm">
          Retry
        </Button>
        <Link href="/admin">
          <Button size="sm">Back to Admin</Button>
        </Link>
      </div>
    </div>
  )
}

export default AdminError
