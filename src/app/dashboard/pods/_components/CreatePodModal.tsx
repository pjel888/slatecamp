'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createPod } from '@/lib/actions/pods'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreatePodModalProps {
  onClose: () => void
  onCreated: (podId: string) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export const CreatePodModal = ({ onClose, onCreated }: CreatePodModalProps) => {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<Element | null>(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement
    inputRef.current?.focus()
    return () => {
      if (previousFocusRef.current && 'focus' in previousFocusRef.current) {
        ;(previousFocusRef.current as HTMLElement).focus()
      }
    }
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleFocusTrap = (e: FocusEvent) => {
      if (!dialog.contains(e.target as Node)) inputRef.current?.focus()
    }
    document.addEventListener('focusin', handleFocusTrap)
    return () => document.removeEventListener('focusin', handleFocusTrap)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
    },
    [onClose],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createPod(name)
      if (result.ok === false) {
        setError(result.error)
        return
      }
      onCreated(result.data.pod_id)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-pod-title"
        className="w-full max-w-sm rounded-lg bg-card p-6 shadow-modal"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 id="create-pod-title" className="text-sm font-semibold text-foreground">
              Create a Study Pod
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Up to 6 members. Share the invite code to bring teammates in.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-3 rounded-sm p-1 text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="pod-name"
              className="mb-1.5 block text-xs font-medium text-foreground"
            >
              Pod name
            </label>
            <input
              ref={inputRef}
              id="pod-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Friday Study Group"
              maxLength={60}
              className={cn(
                'w-full rounded-sm border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
                'outline-none transition-colors duration-150',
                'focus:border-primary focus:ring-1 focus:ring-primary',
                error ? 'border-destructive' : 'border-border',
              )}
            />
            {error && (
              <p className="mt-1.5 text-xs text-destructive">{error}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isPending || !name.trim()}
            >
              {isPending ? 'Creating…' : 'Create pod'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
