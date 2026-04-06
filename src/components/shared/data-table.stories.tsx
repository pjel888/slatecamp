import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from './data-table'

interface ArticleRow extends Record<string, unknown> {
  id: string
  title: string
  status: 'Draft' | 'Review' | 'Published'
  owner: string
  score: number
  lastPublished: string
}

const rows: ArticleRow[] = [
  {
    id: 'wiki-001',
    title: 'Site planning setbacks',
    status: 'Published',
    owner: 'Philip',
    score: 92,
    lastPublished: '2026-04-05T10:30:00.000Z',
  },
  {
    id: 'wiki-002',
    title: 'Zoning classifications',
    status: 'Review',
    owner: 'Mika',
    score: 84,
    lastPublished: '2026-04-04T08:15:00.000Z',
  },
  {
    id: 'wiki-003',
    title: 'Egress calculations',
    status: 'Draft',
    owner: 'Paolo',
    score: 67,
    lastPublished: '2026-04-02T16:00:00.000Z',
  },
]

const columns: Column<ArticleRow>[] = [
  {
    key: 'title',
    header: 'Article',
    sortable: true,
    render: (row) => (
      <div className="space-y-0.5">
        <p className="font-medium text-foreground">{row.title}</p>
        <p className="font-mono text-[11px] text-muted-foreground">{row.id}</p>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (row) => {
      const variant =
        row.status === 'Published'
          ? 'success'
          : row.status === 'Review'
            ? 'warning'
            : 'outline'

      return <Badge variant={variant}>{row.status}</Badge>
    },
  },
  {
    key: 'owner',
    header: 'Owner',
    sortable: true,
  },
  {
    key: 'score',
    header: 'Confidence',
    type: 'number',
    sortable: true,
  },
  {
    key: 'lastPublished',
    header: 'Updated',
    type: 'date',
    sortable: true,
  },
  {
    key: 'actions',
    header: '',
    type: 'action',
    render: () => (
      <Button variant="ghost" size="sm">
        Review
      </Button>
    ),
  },
]

interface ArticleTableStoryProps {
  selectable?: boolean
  loading?: boolean
  empty?: boolean
}

const ArticleTableStory = ({
  selectable = false,
  loading = false,
  empty = false,
}: ArticleTableStoryProps) => {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set(['wiki-002']))

  return (
    <DataTable<ArticleRow>
      className="w-[920px] max-w-full"
      columns={columns}
      data={empty ? [] : rows}
      keyField="id"
      searchable
      searchFields={['title', 'owner', 'status']}
      searchPlaceholder="Search articles"
      selectable={selectable}
      selectedKeys={selectable ? selectedKeys : undefined}
      onSelectionChange={selectable ? setSelectedKeys : undefined}
      bulkActions={
        selectable ? (
          <Button variant="secondary" size="sm">
            Assign reviewer
          </Button>
        ) : undefined
      }
      defaultSort={{ key: 'lastPublished', direction: 'desc' }}
      emptyMessage="No article rows match the current filter."
      emptyAction={{ label: 'Create article', onClick: () => undefined }}
      loading={loading}
      pageSize={10}
    />
  )
}

const meta = {
  title: 'Shared/DataTable',
  component: ArticleTableStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/shared/data-table',
      },
    },
  },
} satisfies Meta<typeof ArticleTableStory>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {}

export const Selectable: Story = {
  args: {
    selectable: true,
  },
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}

export const Empty: Story = {
  args: {
    empty: true,
  },
}
