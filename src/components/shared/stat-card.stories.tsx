import type { Meta, StoryObj } from '@storybook/react'
import { StatCard } from './stat-card'

const meta = {
  title: 'Shared/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/shared/stat-card',
      },
    },
  },
} satisfies Meta<typeof StatCard>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  args: {
    className: 'w-[220px]',
    eyebrow: 'Publishing',
    value: '124',
    subtitle: 'Articles updated this month',
    trend: {
      direction: 'up',
      label: '+18 from last month',
    },
  },
}

export const Grid: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        eyebrow="MRR"
        value="$12.4k"
        subtitle="Current recurring revenue"
        trend={{ direction: 'up', label: '+6.2%' }}
        className="w-[220px]"
      />
      <StatCard
        eyebrow="Readiness"
        value="78%"
        subtitle="Median weekly score"
        trend={{ direction: 'flat', label: 'Stable' }}
        className="w-[220px]"
      />
      <StatCard
        eyebrow="Editorial debt"
        value="9"
        subtitle="Articles still missing citations"
        trend={{ direction: 'down', label: '-4 this week' }}
        color="text-warning"
        className="w-[220px]"
      />
    </div>
  ),
}
