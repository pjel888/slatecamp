'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deleteWikiArticle } from '@/lib/actions/admin/wiki'
import { toast } from '@/lib/hooks/use-toast'

interface DeleteArticleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  articleId: string
  articleTitle: string
  onSuccess?: () => void
  redirectTo?: string
}

export const DeleteArticleModal = ({
  open,
  onOpenChange,
  articleId,
  articleTitle,
  onSuccess,
  redirectTo,
}: DeleteArticleModalProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [justDeleted, setJustDeleted] = useState(false)

  useEffect(() => {
    if (justDeleted) {
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.refresh()
      }
      setJustDeleted(false)
    }
  }, [justDeleted, redirectTo, router])

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteWikiArticle(articleId)
      toast({
        title: 'Article archived',
        description: `"${articleTitle}" has been moved to archived status.`,
        variant: 'success',
      })
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
      setJustDeleted(true)
    } catch (error) {
      toast({
        title: 'Archive failed',
        description: error instanceof Error ? error.message : 'Failed to archive article',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Archive Article</DialogTitle>
          <DialogDescription>
            Are you sure you want to archive <span className="font-medium text-foreground">&ldquo;{articleTitle}&rdquo;</span>?
            This will remove it from the student-facing wiki but preserve the record and its linked questions in the system.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={loading}>
            Archive Article
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
