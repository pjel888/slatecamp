import type { Meta, StoryObj } from '@storybook/react'
import { ScoreDisplay } from './score-display'

const meta = {
  title: 'Shared/ScoreDisplay',
  component: ScoreDisplay,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/shared/score-display',
      },
    },
  },
  args: {
    value: 78,
    label: 'Readiness score',
  },
} satisfies Meta<typeof ScoreDisplay>

export default meta

type Story = StoryObj<typeof meta>

export const Ring: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="grid gap-6 md:grid-cols-4">
      <ScoreDisplay value={82} label="Ring" animate={false} />
      <ScoreDisplay value={61} label="Bar" variant="bar" animate={false} className="w-32" />
      <ScoreDisplay value={45} label="Pill" variant="pill" animate={false} />
      <ScoreDisplay value={29} label="Number" variant="number" animate={false} size="lg" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <ScoreDisplay value={74} size="sm" animate={false} />
      <ScoreDisplay value={74} size="md" animate={false} />
      <ScoreDisplay value={74} size="lg" animate={false} />
      <ScoreDisplay value={74} size="xl" animate={false} />
    </div>
  ),
}
