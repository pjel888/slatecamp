import type { Meta, StoryObj } from '@storybook/react'
import { WikiNoteAnchor } from './WikiNoteAnchor'
import { useNoteContext } from '@/lib/context/note-context'

const AnchorInspector = () => {
  const { anchor } = useNoteContext()

  return (
    <div className="space-y-4 rounded-md border border-border bg-white p-6">
      <WikiNoteAnchor
        article_id="storybook-article"
        article_title="Fire Separation, Occupancy, and Exit Strategy"
        topic_id="storybook-topic"
        topic_name="Fire Safety Planning"
        source_url="/dashboard/wiki/fire-separation-occupancy-exit-strategy"
      />
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-secondary">
          Current note anchor
        </p>
        <pre className="mt-3 overflow-auto rounded-md bg-muted p-4 text-xs text-text-secondary">
          {JSON.stringify(anchor, null, 2)}
        </pre>
      </div>
    </div>
  )
}

const meta = {
  title: 'Wiki/Sources and Notes/Wiki Note Anchor',
  component: WikiNoteAnchor,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/shared/WikiNoteAnchor',
      },
    },
  },
  args: {
    article_id: 'storybook-article',
    article_title: 'Fire Separation, Occupancy, and Exit Strategy',
    topic_id: 'storybook-topic',
    topic_name: 'Fire Safety Planning',
    source_url: '/dashboard/wiki/fire-separation-occupancy-exit-strategy',
  },
} satisfies Meta<typeof WikiNoteAnchor>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <AnchorInspector />,
}
