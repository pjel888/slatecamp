import type { Meta, StoryObj } from '@storybook/react'
import { ReadinessScoreRing } from './ReadinessScoreRing'

const meta = {
  title: 'Score/ReadinessScoreRing',
  component: ReadinessScoreRing,
  tags: ['autodocs'],
  argTypes: {
    score: { control: { type: 'range', min: 0, max: 100 } },
    zone: {
      control: 'select',
      options: ['strong', 'green', 'amber', 'needs-review'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof ReadinessScoreRing>

export default meta
type Story = StoryObj<typeof meta>

export const Strong: Story = {
  args: {
    score: 92,
    zone: 'strong',
    size: 'md',
  },
}

export const OnTrack: Story = {
  args: {
    score: 75,
    zone: 'green',
    size: 'md',
  },
}

export const Developing: Story = {
  args: {
    score: 58,
    zone: 'amber',
    size: 'md',
  },
}

export const NeedsReview: Story = {
  args: {
    score: 34,
    zone: 'needs-review',
    size: 'md',
  },
}

export const Small: Story = {
  args: {
    score: 85,
    zone: 'green',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    score: 85,
    zone: 'green',
    size: 'lg',
  },
}

export const WithDelta: Story = {
  args: {
    score: 85,
    previousScore: 80,
    zone: 'green',
    showDelta: true,
  },
}
