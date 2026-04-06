import type { Meta, StoryObj } from '@storybook/react'
import { DifficultyBar } from './difficulty-bar'

const meta = {
  title: 'Shared/DifficultyBar',
  component: DifficultyBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/shared/difficulty-bar',
      },
    },
  },
  args: {
    value: 0.58,
    size: 'md',
  },
} satisfies Meta<typeof DifficultyBar>

export default meta

type Story = StoryObj<typeof meta>

export const Segmented: Story = {}

export const Linear: Story = {
  args: {
    size: 'sm',
    value: 0.74,
  },
}

export const RangeExamples: Story = {
  render: () => (
    <div className="space-y-3">
      <DifficultyBar value={0.18} size="sm" />
      <DifficultyBar value={0.46} size="sm" />
      <DifficultyBar value={0.82} size="sm" />
    </div>
  ),
}
