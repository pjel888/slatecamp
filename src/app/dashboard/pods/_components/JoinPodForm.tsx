'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { joinPod } from '@/lib/actions/pods'

// ─── Component ───────────────────────────────────────────────────────────────

export const JoinPodForm = () => {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await joinPod(code)
      if (result.ok === false) {
        setError(result.error)
        return
      }
      router.push(`/dashboard/pods/${result.data.pod_id}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1">
        <label htmlFor="invite-code" className="mb-1.5 block text-xs font-medium text-foreground">
          Invite code
        </label>
        <input
          id="invite-code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.trim())}
          placeholder="e.g. a3f9d2"
          className={cn(
            'w-full rounded-sm border px-3 py-2 text-sm font-mono text-foreground placeholder:font-sans placeholder:text-muted-foreground',
            'outline-none transition-colors duration-150',
            'focus:border-primary focus:ring-1 focus:ring-primary',
            error ? 'border-destructive' : 'border-border',
          )}
        />
        {error && (
          <p className="mt-1.5 text-xs text-destructive">{error}</p>
        )}
      </div>
      <Button
        type="submit"
        variant="secondary"
        size="md"
        disabled={isPending || !code}
        className="mb-px"
      >
        {isPending ? 'Joining…' : 'Join'}
      </Button>
    </form>
  )
}
