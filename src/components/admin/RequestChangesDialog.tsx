'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { requestChanges } from '@/lib/wiki/wiki-actions'

interface RequestChangesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  articleId: string
  articleTitle: string
  onSuccess: () => void
}

export const RequestChangesDialog = ({
  open,
  onOpenChange,
  articleId,
  articleTitle,
  onSuccess,
}: RequestChangesDialogProps) => {
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await requestChanges(articleId, comment)
      if (result.success) {
        setComment('')
        onOpenChange(false)
        onSuccess()
      } else {
        setError(result.error ?? 'Failed to send feedback')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (!loading) {
      setComment('')
      setError(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Request Changes</DialogTitle>
          <DialogDescription>
            Provide feedback for{' '}
            <span className="font-medium text-foreground">&ldquo;{articleTitle}&rdquo;</span>.
            The author will be notified and the article will be moved back to draft.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="reviewer-notes"
            className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            Reviewer Notes
          </label>
          <textarea
            id="reviewer-notes"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe what needs to be changed or improved..."
            rows={4}
            className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 resize-none"
            aria-label="Reviewer notes"
          />
        </div>

        {error && (
          <p className="text-[11px] text-[#D64545] bg-[#FDF0F0] border border-[#D64545]/20 rounded-sm px-3 py-2">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSubmit} loading={loading}>
            Send Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
