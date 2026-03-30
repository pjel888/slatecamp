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
        title: 'Article deleted',
        description: `"${articleTitle}" has been removed.`,
        variant: 'default',
      })
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
      setJustDeleted(true)
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete article',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete Article</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-medium text-foreground">&ldquo;{articleTitle}&rdquo;</span>?
            This action cannot be undone. The article will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={loading}>
            Delete Article
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
