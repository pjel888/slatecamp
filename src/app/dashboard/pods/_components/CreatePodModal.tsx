'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'
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
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <ModalContent size="sm" role="dialog">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <ModalHeader>
            <ModalTitle>Create a Study Pod</ModalTitle>
            <ModalDescription>
              Up to 6 members. Share the invite code to bring teammates in.
            </ModalDescription>
          </ModalHeader>

          <ModalBody className="p-4">
            <label
              htmlFor="pod-name"
              className="mb-1.5 block text-xs font-medium text-foreground"
            >
              Pod name
            </label>
            <input
              id="pod-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Friday Study Group"
              maxLength={60}
              autoFocus
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
          </ModalBody>

          <ModalFooter>
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
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
