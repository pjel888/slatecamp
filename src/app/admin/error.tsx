'use client'

import { useEffect } from 'react'
import { Warning } from '@phosphor-icons/react/dist/ssr'
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
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF0F0]">
        <Warning size={24} className="text-destructive" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-text-primary">
          Something went wrong
        </h2>
        <p className="mt-1 max-w-sm text-sm text-text-secondary">
          {error.message || 'An unexpected error occurred in the admin area.'}
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-[11px] text-text-tertiary">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button
          onClick={reset}
          size="sm"
          className="bg-camp-cobalt text-white hover:bg-[#1535A8]"
        >
          Try again
        </Button>
        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default AdminError
