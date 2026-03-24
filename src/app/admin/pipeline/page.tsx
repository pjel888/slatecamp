import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Publishing Pipeline — SlateCamp Admin' }
import { SectionHeader } from '@/components/shared/section-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PipelineArticle {
  article_id: string
  title: string
  slug: string
  status: string
  updated_at: string
  created_at: string
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const formatRelativeTime = (dateStr: string): string => {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`

  const months = Math.floor(days / 30)
  return `${months}mo ago`
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

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const PipelinePage = async () => {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('wiki_articles')
    .select('article_id, title, slug, status, updated_at, created_at')
    .order('updated_at', { ascending: false })

  const grouped: Record<string, PipelineArticle[]> = {
    draft: [],
    review: [],
    published: [],
  }

  for (const article of (articles ?? []) as PipelineArticle[]) {
    const bucket = grouped[article.status]
    if (bucket) {
      bucket.push(article)
    } else {
      // Treat unknown statuses as draft
      grouped.draft.push(article)
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Quality"
        title="Publishing Pipeline"
        subtitle="Track content through the publishing workflow"
        level="page"
      />

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
                    <Link
                      key={article.article_id}
                      href={`/admin/articles/${article.article_id}`}
                      className="block rounded-md border border-border p-2.5 transition-colors duration-150 hover:border-primary/30 hover:bg-muted/50"
                    >
                      <p className="text-sm font-medium leading-snug line-clamp-2">
                        {article.title}
                      </p>
                      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground mt-0.5 truncate">
                        {article.slug}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {formatRelativeTime(article.updated_at)}
                      </p>
                    </Link>
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

export default PipelinePage
