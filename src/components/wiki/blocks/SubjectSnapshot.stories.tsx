import type { Meta, StoryObj } from '@storybook/react'
import { SubjectSnapshot } from './SubjectSnapshot'
import { wikiSubjectSnapshotFixture } from '@/storybook/fixtures/wiki'

const meta = {
  title: 'Wiki/Blocks/Subject Snapshot',
  component: SubjectSnapshot,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/blocks/SubjectSnapshot',
      },
    },
  },
  args: {
    items: wikiSubjectSnapshotFixture,
  },
} satisfies Meta<typeof SubjectSnapshot>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const FlatGrid: Story = {
  args: {
    items: [
      { label: 'Primary code', value: 'NBCP IRR' },
      { label: 'Secondary code', value: 'Fire Code IRR' },
      { label: 'Question pattern', value: 'Exit count' },
      { label: 'Most tested', value: 'Occupancy load' },
    ],
  },
}
