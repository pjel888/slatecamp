'use client'

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

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<Article>[] = [
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
      <Link
        href={`/admin/content/${row.article_id}`}
        className="whitespace-nowrap text-xs text-[#1B3FC4] hover:text-[#1535A8] transition-colors duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        Edit with Questions &rarr;
      </Link>
    ),
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const ArticlesClient = ({ articles }: ArticlesClientProps) => {
  const router = useRouter()

  const handleRowClick = (row: Article) => {
    router.push(`/admin/articles/${row.article_id}`)
  }

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

      <DataTable
        columns={columns}
        data={articles}
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
  )
}
