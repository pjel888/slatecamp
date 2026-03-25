'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, ArrowSquareOut, Question, FileText, Cube } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApproveDialog } from '@/components/admin/ApproveDialog'
import { RequestChangesDialog } from '@/components/admin/RequestChangesDialog'
import { formatRelativeTime } from '@/lib/utils/format-time'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PendingItem {
  id: string
  type: 'question' | 'wiki' | 'asset'
  title: string
  slug: string | null
  updated_at: string
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

  useEffect(() => {
    loadPendingItems()
  }, [])

  const loadPendingItems = async () => {
    const supabase = createClient()

    const { data: wikiData } = await supabase
      .from('wiki_articles')
      .select('article_id, title, slug, status, updated_at')
      .eq('status', 'review')
      .order('updated_at', { ascending: false })
      .limit(20)

    const wikiItems: PendingItem[] = (wikiData || []).map((a) => ({
      id: a.article_id,
      type: 'wiki' as const,
      title: a.title || 'Untitled',
      slug: a.slug ?? null,
      updated_at: a.updated_at,
    }))

    setItems(wikiItems)
    setLoading(false)
  }

  const handleItemRemoved = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const openApprove = (item: PendingItem) => {
    setError(null)
    setDialog({ type: 'approve', item })
  }

  const openChanges = (item: PendingItem) => {
    setError(null)
    setDialog({ type: 'changes', item })
  }

  const closeDialog = () => setDialog({ type: null, item: null })

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

      {/* Approve dialog */}
      {dialog.type === 'approve' && dialog.item && (
        <ApproveDialog
          open
          onOpenChange={(open) => { if (!open) closeDialog() }}
          articleId={dialog.item.id}
          articleTitle={dialog.item.title}
          onSuccess={() => handleItemRemoved(dialog.item!.id)}
        />
      )}

      {/* Request changes dialog */}
      {dialog.type === 'changes' && dialog.item && (
        <RequestChangesDialog
          open
          onOpenChange={(open) => { if (!open) closeDialog() }}
          articleId={dialog.item.id}
          articleTitle={dialog.item.title}
          onSuccess={() => handleItemRemoved(dialog.item!.id)}
        />
      )}
    </>
  )
}
