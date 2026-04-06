import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/ui/button'
import { SectionHeader } from './section-header'

const meta = {
  title: 'Shared/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/shared/section-header',
      },
    },
  },
  args: {
    title: 'Storybook overhaul',
    subtitle: 'Replace stale scaffolds with real component documentation.',
  },
} satisfies Meta<typeof SectionHeader>

export default meta

type Story = StoryObj<typeof meta>

export const PageLevel: Story = {
  args: {
    eyebrow: 'Developer portal',
    level: 'page',
    action: <Button size="sm">Open tracker</Button>,
  },
}

export const SectionLevel: Story = {
  args: {
    eyebrow: 'Phase 3',
    level: 'section',
    action: <Button variant="secondary" size="sm">View stories</Button>,
  },
}

export const CardLevel: Story = {
  args: {
    eyebrow: 'Queue',
    title: 'Articles needing review',
    subtitle: 'Sorted by freshness and source completeness.',
    level: 'card',
  },
}
