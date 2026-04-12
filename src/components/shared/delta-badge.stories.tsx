import type { Meta, StoryObj } from '@storybook/react'
import { DeltaBadge } from './delta-badge'

const meta = {
  title: 'Shared/DeltaBadge',
  component: DeltaBadge,
  tags: ['autodocs'],
  argTypes: {
    delta: { control: 'number' },
    showPercent: { control: 'boolean' },
  },
} satisfies Meta<typeof DeltaBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Positive: Story = {
  args: {
    delta: 12,
  },
}

export const Negative: Story = {
  args: {
    delta: -5,
  },
}

export const Neutral: Story = {
  args: {
    delta: 0,
  },
}

export const NoPercent: Story = {
  args: {
    delta: 25,
    showPercent: false,
  },
}
