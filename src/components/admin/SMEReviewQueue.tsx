'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { approveArticle, requestChanges } from '@/lib/wiki/wiki-actions'
import { CheckCircle, XCircle, ChatCircle, Question, FileText, Cube } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface PendingItem {
  id: string
  type: 'question' | 'wiki' | 'asset'
  title: string
  updated_at: string
}

export const SMEReviewQueue = () => {
  const [items, setItems] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [commentItemId, setCommentItemId] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  useEffect(() => {
    loadPendingItems()
  }, [])

  const loadPendingItems = async () => {
    const supabase = createClient()

    // Load articles in review status
    const { data: wikiData } = await supabase
      .from('wiki_articles')
      .select('article_id, title, status, updated_at')
      .eq('status', 'review')
      .order('updated_at', { ascending: false })
      .limit(20)

    const wikiItems: PendingItem[] = (wikiData || []).map((a) => ({
      id: a.article_id,
      type: 'wiki' as const,
      title: a.title || 'Untitled',
      updated_at: a.updated_at,
    }))

    setItems(wikiItems)
    setLoading(false)
  }

  const handleApprove = async (item: PendingItem) => {
    if (item.type !== 'wiki') return

    setProcessingId(item.id)
    setError(null)
    try {
      const result = await approveArticle(item.id)
      if (result.success) {
        setItems((prev) => prev.filter((i) => i.id !== item.id))
      } else {
        setError(result.error || 'Failed to approve')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRequestChanges = async (item: PendingItem) => {
    if (item.type !== 'wiki') return

    setProcessingId(item.id)
    setError(null)
    try {
      const result = await requestChanges(item.id, comment)
      if (result.success) {
        setItems((prev) => prev.filter((i) => i.id !== item.id))
        setCommentItemId(null)
        setComment('')
      } else {
        setError(result.error || 'Failed to request changes')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setProcessingId(null)
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

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)

    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHr < 24) return `${diffHr}h ago`
    if (diffDay <= 7) return `${diffDay}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading review queue...</div>
  }

  return (
    <div className="space-y-4">
      {/* Error banner */}
      {error && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm text-red-700 dark:text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 text-xs"
            aria-label="Dismiss error"
          >
            <SCIcon icon={XCircle} size="sm" />
          </button>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-sm border border-input bg-background text-sm"
          aria-label="Filter by content type"
        >
          <option value="">All Types</option>
          <option value="wiki">Wiki Articles</option>
          <option value="question">Questions</option>
          <option value="asset">3D Assets</option>
        </select>
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
            const isProcessing = processingId === item.id
            const showCommentInput = commentItemId === item.id

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="rounded-md border border-border bg-card p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-md bg-muted">
                    <SCIcon icon={Icon} size="md" />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)} · Updated {formatRelativeTime(item.updated_at)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(item)}
                      disabled={isProcessing}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors duration-150"
                      aria-label={`Approve ${item.title}`}
                    >
                      <SCIcon icon={CheckCircle} size="sm" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCommentItemId(showCommentInput ? null : item.id)
                        setComment('')
                      }}
                      disabled={isProcessing}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-sm border border-input hover:bg-muted disabled:opacity-50 transition-colors duration-150"
                      aria-label={`Request changes for ${item.title}`}
                    >
                      <SCIcon icon={ChatCircle} size="sm" />
                      Request Changes
                    </button>
                  </div>
                </div>

                {/* Inline comment input (replaces prompt()) */}
                {showCommentInput && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Enter feedback (optional)..."
                      className="flex-1 px-3 py-1.5 text-sm rounded-sm border border-input bg-background"
                      aria-label="Feedback comment"
                    />
                    <button
                      type="button"
                      onClick={() => handleRequestChanges(item)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 text-sm rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors duration-150"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCommentItemId(null); setComment('') }}
                      className="px-3 py-1.5 text-sm rounded-sm border border-input hover:bg-muted transition-colors duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
