'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Badge } from '@/components/ui/badge'
import { DifficultyBar } from '@/components/ui/difficulty-bar'
import { QuestionQualityBadges } from '@/components/admin/QuestionQualityBadges'
import { QuestionQuickPreview } from '@/components/admin/QuestionQuickPreview'
import { BulkActionBar } from '@/components/admin/BulkActionBar'
import { bulkDeleteQuestions } from '@/lib/actions/admin/bulk'

interface Question extends Record<string, unknown> {
  question_id: string
  text: string
  topic_id: string
  difficulty: number | null
  rationale: string | null
  code_citation: string | null
  created_at: string
  updated_at: string
  options: unknown[]
}


type Row = Record<string, unknown>

const asQ = (row: Row) => row as unknown as Question

const columns: Column<Row>[] = [
  {
    key: 'text',
    header: 'Stem',
    sortable: true,
    render: (row) => (
      <span className="block max-w-[400px] truncate text-sm text-foreground">
        {asQ(row).text || '\u2014'}
      </span>
    ),
  },
  {
    key: 'topic_id',
    header: 'Topic',
    render: (row) => {
      const q = asQ(row)
      return q.topic_id ? (
        <Badge variant="primary" size="xs" pill>
          {q.topic_id.slice(0, 8)}
        </Badge>
      ) : (
        <span className="text-muted-foreground">{'\u2014'}</span>
      )
    },
  },
  {
    key: 'difficulty',
    header: 'Difficulty',
    sortable: true,
    render: (row) => <DifficultyBar value={asQ(row).difficulty} size="sm" />,
  },
  {
    key: 'quality',
    header: 'Quality',
    render: (row) => {
      const q = asQ(row)
      return (
        <QuestionQualityBadges
          hasRationale={Boolean(q.rationale)}
          hasCitation={Boolean(q.code_citation)}
        />
      )
    },
  },
  {
    key: 'code_citation',
    header: 'Citation',
    render: (row) => {
      const q = asQ(row)
      return q.code_citation ? (
        <span className="text-[11px] font-[family-name:var(--font-dm-mono)] text-foreground">
          {q.code_citation}
        </span>
      ) : (
        <span className="text-muted-foreground">{'\u2014'}</span>
      )
    },
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
    render: (row) => {
      const q = asQ(row)
      const opts = q.options as string[] | { text: string; is_correct?: boolean }[]
      return (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <QuestionQuickPreview
            stem={q.text}
            options={opts && opts.length > 0 ? opts : ['', '', '', '']}
            correctAnswer={0}
            rationale={q.rationale}
            codeCitation={q.code_citation}
          />
          {q.topic_id && (
            <Link
              href={`/admin/content?topic=${q.topic_id}`}
              className="whitespace-nowrap text-xs text-camp-cobalt hover:text-[#1535A8] transition-colors duration-150"
              onClick={(e) => e.stopPropagation()}
              title="Open content editor to view this question in article context"
            >
              View in context &rarr;
            </Link>
          )}
        </div>
      )
    },
  },
]

interface QuestionsTableClientProps {
  questions: Question[]
}

export const QuestionsTableClient = ({ questions }: QuestionsTableClientProps) => {
  const router = useRouter()
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

  const handleBulkDelete = async () => {
    const result = await bulkDeleteQuestions([...selectedKeys])
    if (result.error) throw new Error(result.error)
    setSelectedKeys(new Set())
  }

  return (
    <DataTable
      columns={columns}
      data={questions as unknown as Row[]}
      keyField="question_id"
      searchable
      searchPlaceholder="Search question stems..."
      searchFields={['text', 'code_citation']}
      pageSize={50}
      onRowClick={(row) => {
        const id = asQ(row).question_id
        router.push(`/admin/questions/${id}`)
      }}
      emptyMessage="No questions found"
      selectable
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}
      bulkActions={
        <BulkActionBar
          selectedCount={selectedKeys.size}
          onDelete={handleBulkDelete}
          entityName="questions"
        />
      }
    />
  )
}
