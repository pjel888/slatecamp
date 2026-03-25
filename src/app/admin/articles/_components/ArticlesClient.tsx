'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Article extends Record<string, unknown> {
  article_id: string
  title: string
  slug: string | null
  status: string | null
  content: string | null
  created_at: string
  updated_at: string
  word_count?: number
  questionCount?: number
  hasCoverage?: boolean
}

interface ArticlesClientProps {
  articles: Article[]
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const computeWordCount = (content: string | null): number =>
  content ? content.split(/\s+/).filter(Boolean).length : 0

const normalizeStatus = (status: string | null): 'published' | 'draft' =>
  status === 'published' ? 'published' : 'draft'

type StatusFilter = 'all' | 'published' | 'draft' | 'review'

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const buildColumns = (): Column<Article>[] => [
  {
    key: 'title',
    header: 'Title',
    sortable: true,
    render: (row) => (
      <span className="truncate max-w-[300px] block font-medium text-foreground">
        {row.title || '\u2014'}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <StatusBadge status={normalizeStatus(row.status)} />
    ),
  },
  {
    key: 'questionCount',
    header: 'Questions',
    type: 'number',
    sortable: true,
    render: (row) => (
      <span className="font-[family-name:var(--font-dm-mono)] text-[11px] tabular-nums">
        {row.questionCount ?? 0}
      </span>
    ),
  },
  {
    key: 'hasCoverage',
    header: 'Coverage',
    render: (row) => (
      row.questionCount && row.questionCount > 0
        ? <span className="text-[11px] font-medium text-emerald">Complete</span>
        : <span className="text-[11px] font-medium text-muted-foreground">GAPS</span>
    ),
  },
  {
    key: 'word_count',
    header: 'Words',
    type: 'number',
    render: (row) => (
      <span className="font-mono tabular-nums text-right block">
        {computeWordCount(row.content).toLocaleString()}
      </span>
    ),
  },
  {
    key: 'updated_at',
    header: 'Updated',
    type: 'date',
    sortable: true,
  },
  {
    key: 'actions',
    header: '',
    type: 'action',
    render: (row) => (
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/content/${row.article_id}`}
          className="whitespace-nowrap text-xs text-camp-cobalt hover:text-primary-700 transition-colors duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          Edit with Questions &rarr;
        </Link>
        {row.slug && (
          <Link
            href={`/dashboard/wiki/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap text-xs text-text-tertiary hover:text-text-secondary transition-colors duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            Preview ↗
          </Link>
        )}
      </div>
    ),
  },
]

const columns = buildColumns()

/* ------------------------------------------------------------------ */
/*  Status filter tabs sub-component                                   */
/* ------------------------------------------------------------------ */

interface StatusTabsProps {
  articles: Article[]
  active: StatusFilter
  onChange: (filter: StatusFilter) => void
}

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Draft' },
  { key: 'review', label: 'Review' },
]

const StatusTabs = ({ articles, active, onChange }: StatusTabsProps) => {
  const counts: Record<StatusFilter, number> = {
    all: articles.length,
    published: articles.filter((a) => a.status === 'published').length,
    draft: articles.filter((a) => !a.status || a.status === 'draft').length,
    review: articles.filter((a) => a.status === 'review').length,
  }

  return (
    <div className="flex items-center gap-0 border-b border-border">
      {STATUS_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 text-xs font-medium transition-colors duration-150 border-b-2 -mb-px ${
            active === tab.key
              ? 'border-camp-cobalt text-camp-cobalt'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
          <span
            className={`ml-1.5 font-mono text-[11px] ${
              active === tab.key ? 'text-camp-cobalt' : 'text-text-tertiary'
            }`}
          >
            ({counts[tab.key]})
          </span>
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const ArticlesClient = ({ articles }: ArticlesClientProps) => {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const handleRowClick = (row: Article) => {
    router.push(`/admin/articles/${row.article_id}`)
  }

  const filteredArticles = articles.filter((a) => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'published') return a.status === 'published'
    if (statusFilter === 'review') return a.status === 'review'
    return !a.status || a.status === 'draft'
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Articles"
        subtitle="Manage knowledge base content"
        actions={
          <Link href="/admin/articles/new">
            <Button size="sm">New Article</Button>
          </Link>
        }
      />

      <div className="space-y-0">
        <StatusTabs
          articles={articles}
          active={statusFilter}
          onChange={setStatusFilter}
        />

        <DataTable
          columns={columns}
          data={filteredArticles}
          keyField="article_id"
          searchable
          searchPlaceholder="Search articles..."
          searchFields={['title']}
          pageSize={50}
          onRowClick={handleRowClick}
          emptyMessage="No articles yet"
          defaultSort={{ key: 'updated_at', direction: 'desc' }}
        />
      </div>
    </div>
  )
}
