'use client'

import { useRouter } from 'next/navigation'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Badge } from '@/components/ui/badge'

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

const difficultyBar = (value: number | null) => {
  const d = value ?? 0.5
  const pct = Math.round(d * 100)

  // Color based on difficulty: low = emerald, mid = amber, high = red
  const barColor =
    d < 0.35
      ? 'bg-emerald-500'
      : d < 0.65
        ? 'bg-amber-500'
        : 'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-150 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground tabular-nums font-[family-name:var(--font-dm-mono)]">
        {d.toFixed(2)}
      </span>
    </div>
  )
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
    render: (row) => difficultyBar(asQ(row).difficulty),
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
]

interface QuestionsTableClientProps {
  questions: Question[]
}

export const QuestionsTableClient = ({ questions }: QuestionsTableClientProps) => {
  const router = useRouter()

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
    />
  )
}
