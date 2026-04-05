'use client'

import { useState } from 'react'
import { SearchInput } from '@/components/ui/input'
import { PipelineCard } from './PipelineCard'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PipelineArticle {
  article_id: string
  title: string
  slug: string
  status: string
  updated_at: string
  created_at: string
  reviewed_by: string | null
  subject_label: string | null
}

const COLUMNS = [
  {
    key: 'draft',
    label: 'Draft',
    badgeVariant: 'warning' as const,
    emptyText: 'No drafts',
  },
  {
    key: 'review',
    label: 'In Review',
    badgeVariant: 'info' as const,
    emptyText: 'No articles in review',
  },
  {
    key: 'published',
    label: 'Published',
    badgeVariant: 'success' as const,
    emptyText: 'No published articles',
  },
] as const

export const PipelineClient = ({ initialArticles }: { initialArticles: PipelineArticle[] }) => {
  const [filter, setFilter] = useState('')

  const q = filter.toLowerCase()
  const filtered = initialArticles.filter((article) => {
    if (!q) return true
    return (
      article.title.toLowerCase().includes(q) ||
      article.slug.toLowerCase().includes(q) ||
      (article.subject_label && article.subject_label.toLowerCase().includes(q)) ||
      (article.reviewed_by && article.reviewed_by.toLowerCase().includes(q))
    )
  })

  const grouped: Record<string, PipelineArticle[]> = {
    draft: [],
    review: [],
    published: [],
  }

  for (const article of filtered) {
    const bucket = grouped[article.status]
    if (bucket) {
      bucket.push(article)
    } else {
      grouped.draft.push(article)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <SearchInput
            placeholder="Filter by title, discipline, or assignee..."
            value={filter}
            onChange={(value) => setFilter(value)}
          />
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          Showing {filtered.length} of {initialArticles.length} items
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const items = grouped[col.key]
          return (
            <Card key={col.key} size="sm" className="flex flex-col">
              <div className="flex items-center justify-between px-3 pt-3 pb-2">
                <span className="text-sm font-medium">{col.label}</span>
                <Badge variant={col.badgeVariant} size="xs">
                  {items.length}
                </Badge>
              </div>

              <div className="flex-1 px-3 pb-3 space-y-1.5">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">
                    {col.emptyText}
                  </p>
                ) : (
                  items.map((article) => (
                    <PipelineCard
                      key={article.article_id}
                      article={article as any}
                      columnKey={col.key}
                    />
                  ))
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
