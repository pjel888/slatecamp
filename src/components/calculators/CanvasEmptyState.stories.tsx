import type { Meta, StoryObj } from '@storybook/react'
import { CanvasEmptyState } from './CanvasEmptyState'

const meta = {
  title: 'Calculators/CanvasEmptyState',
  component: CanvasEmptyState,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/calculators/CanvasEmptyState',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex h-[280px] w-[420px] items-center justify-center rounded-md border border-border bg-card p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CanvasEmptyState>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {}
