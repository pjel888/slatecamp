'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { canReviewContent } from '@/lib/admin/roles'
import { approveArticle, requestChanges } from '@/lib/wiki/wiki-actions'
import { Check, X, MessageSquare, FileQuestion, FileText, Box } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PendingItem {
  id: string
  type: 'question' | 'wiki' | 'asset'
  title: string
  author_id: string
  submitted_at: string
}

export function SMEReviewQueue() {
  const [items, setItems] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadPendingItems()
  }, [])

  const loadPendingItems = async () => {
    const supabase = await createClient()
    
    // Load pending wiki articles
    const { data: wikiData } = await supabase
      .from('wiki_articles')
      .select('id, title, author_id, submitted_at')
      .eq('status', 'pending_review')
      .order('updated_at', { ascending: false })
      .limit(20)

    const wikiItems: PendingItem[] = (wikiData || []).map(a => ({
      id: a.id,
      type: 'wiki' as const,
      title: a.title,
      author_id: a.author_id,
      submitted_at: a.submitted_at,
    }))

    setItems(wikiItems)
    setLoading(false)
  }

  const handleApprove = async (item: PendingItem) => {
    if (item.type !== 'wiki') return
    
    setProcessingId(item.id)
    try {
      const result = await approveArticle(item.id)
      if (result.success) {
        setItems(prev => prev.filter(i => i.id !== item.id))
      } else {
        alert(result.error || 'Failed to approve')
      }
    } finally {
      setProcessingId(null)
    }
  }

  const handleRequestChanges = async (item: PendingItem, comment: string) => {
    if (item.type !== 'wiki') return
    
    setProcessingId(item.id)
    try {
      const result = await requestChanges(item.id, comment)
      if (result.success) {
        setItems(prev => prev.filter(i => i.id !== item.id))
      } else {
        alert(result.error || 'Failed to request changes')
      }
    } finally {
      setProcessingId(null)
    }
  }

  const filteredItems = items.filter(item => 
    typeFilter ? item.type === typeFilter : true
  )

  const typeIcons = {
    question: FileQuestion,
    wiki: FileText,
    asset: Box,
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Types</option>
          <option value="wiki">Wiki Articles</option>
          <option value="question">Questions</option>
          <option value="asset">3D Assets</option>
        </select>
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

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="rounded-md border border-border bg-card p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-md bg-muted">
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • 
                      Submitted {new Date(item.submitted_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(item)}
                      disabled={isProcessing}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const comment = prompt('Enter comments (optional):')
                        handleRequestChanges(item, comment || '')
                      }}
                      disabled={isProcessing}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-input hover:bg-muted disabled:opacity-50"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Request Changes
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
