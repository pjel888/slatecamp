'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, ArrowSquareOut, Question, FileText, Cube } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils/format-time'
import { REVIEW_QUEUE_STATUSES } from '@/lib/admin/editor-workflow'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { approveWikiArticleReview, requestWikiArticleChanges } from '@/lib/actions/admin/wiki'

interface PendingItem {
  id: string
  type: 'question' | 'wiki' | 'asset'
  title: string
  slug: string | null
  updated_at: string
  status?: string | null
}

interface DialogState {
  type: 'approve' | 'changes' | null
  item: PendingItem | null
}

export const SMEReviewQueue = () => {
  const [items, setItems] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogState>({ type: null, item: null })
  const [reviewerComments, setReviewerComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadPendingItems()
  }, [])

  const loadPendingItems = async () => {
    const supabase = createClient()

    const { data: wikiData } = await supabase
      .from('wiki_articles')
      .select('article_id, title, slug, status, updated_at')
      .in('status', [...REVIEW_QUEUE_STATUSES])
      .order('updated_at', { ascending: false })
      .limit(20)

    const wikiItems: PendingItem[] = (wikiData || []).map((a) => ({
      id: a.article_id,
      type: 'wiki' as const,
      title: a.title || 'Untitled',
      slug: a.slug ?? null,
      updated_at: a.updated_at,
      status: a.status,
    }))

    setItems(wikiItems)
    setLoading(false)
  }

  const handleItemRemoved = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const openApprove = (item: PendingItem) => {
    setError(null)
    setReviewerComments('')
    setDialog({ type: 'approve', item })
  }

  const openChanges = (item: PendingItem) => {
    setError(null)
    setReviewerComments('')
    setDialog({ type: 'changes', item })
  }

  const closeDialog = () => {
    if (isSubmitting) return
    setDialog({ type: null, item: null })
    setReviewerComments('')
  }

  const handleDialogSubmit = async () => {
    if (!dialog.item || dialog.item.type !== 'wiki') return

    setIsSubmitting(true)
    setError(null)
    try {
      if (dialog.type === 'approve') {
        await approveWikiArticleReview(dialog.item.id, reviewerComments)
      } else if (dialog.type === 'changes') {
        await requestWikiArticleChanges(dialog.item.id, reviewerComments)
      }

      handleItemRemoved(dialog.item.id)
      closeDialog()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review action failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredItems = items.filter((item) =>
    typeFilter ? item.type === typeFilter : true,
  )

  const typeIcons = {
    question: Question,
    wiki: FileText,
    asset: Cube,
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading review queue...</div>
  }

  return (
    <>
      <div className="space-y-4">
        {/* Error banner */}
        {error && (
          <div className="p-3 rounded-md bg-destructive-50 border border-destructive/30 text-sm text-destructive flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-destructive hover:opacity-70 text-xs ml-3"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger aria-label="Filter by content type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="wiki">Wiki Articles</SelectItem>
              <SelectItem value="question">Questions</SelectItem>
              <SelectItem value="asset">3D Assets</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="default" size="sm">
            {filteredItems.length} pending
          </Badge>
        </div>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No pending reviews
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const Icon = typeIcons[item.type]

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="rounded-md border border-border bg-card p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-muted">
                      <SCIcon icon={Icon} size="md" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-sm truncate">{item.title}</h4>
                        {item.type === 'wiki' && item.slug && (
                          <a
                            href={`/dashboard/wiki/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-camp-cobalt hover:underline shrink-0"
                            aria-label={`Preview ${item.title} in a new tab`}
                          >
                            Preview Article
                            <SCIcon icon={ArrowSquareOut} size="sm" />
                          </a>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} · Updated {formatRelativeTime(item.updated_at)}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Link
                        href={item.type === 'wiki' ? `/admin/knowledge/${item.id}` : `/admin/knowledge/questions/${item.id}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          Edit & Review
                        </Button>
                      </Link>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => openApprove(item)}
                        leftIcon={<SCIcon icon={CheckCircle} size="sm" />}
                        aria-label={`Approve ${item.title}`}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openChanges(item)}
                        aria-label={`Request changes for ${item.title}`}
                      >
                        Request Changes
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={!!dialog.type} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog.type === 'approve' ? 'Approve article' : 'Request changes'}
            </DialogTitle>
            <DialogDescription>
              {dialog.item
                ? `Review action for "${dialog.item.title}".`
                : 'Review action'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Reviewer comments
            </label>
            <Textarea
              value={reviewerComments}
              onChange={(e) => setReviewerComments(e.target.value)}
              placeholder={
                dialog.type === 'approve'
                  ? 'Optional approval notes'
                  : 'Describe the required changes'
              }
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant={dialog.type === 'approve' ? 'success' : 'secondary'}
              onClick={handleDialogSubmit}
              disabled={isSubmitting || (dialog.type === 'changes' && !reviewerComments.trim())}
            >
              {isSubmitting
                ? 'Saving...'
                : dialog.type === 'approve'
                  ? 'Approve'
                  : 'Request Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
