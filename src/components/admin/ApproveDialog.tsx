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
import { approveArticle } from '@/lib/wiki/wiki-actions'

interface ApproveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  articleId: string
  articleTitle: string
  onSuccess: () => void
}

export const ApproveDialog = ({
  open,
  onOpenChange,
  articleId,
  articleTitle,
  onSuccess,
}: ApproveDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await approveArticle(articleId)
      if (result.success) {
        onOpenChange(false)
        onSuccess()
      } else {
        setError(result.error ?? 'Failed to approve article')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (!loading) {
      setError(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Approve &amp; Publish</DialogTitle>
          <DialogDescription>
            Are you sure you want to publish{' '}
            <span className="font-medium text-foreground">&ldquo;{articleTitle}&rdquo;</span>?
            This will make the article visible to all learners.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-[11px] text-[destructive] bg-[#FDF0F0] border border-[destructive]/20 rounded-sm px-3 py-2">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleConfirm} loading={loading}>
            Approve &amp; Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
