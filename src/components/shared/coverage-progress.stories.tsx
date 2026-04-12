import type { Meta, StoryObj } from '@storybook/react'
import { CoverageProgress } from './coverage-progress'

const meta = {
  title: 'Shared/CoverageProgress',
  component: CoverageProgress,
  tags: ['autodocs'],
  argTypes: {
    filled: { control: { type: 'number', min: 0 } },
    total: { control: { type: 'number', min: 1 } },
    color: { control: 'text' },
  },
} satisfies Meta<typeof CoverageProgress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Architecture',
    filled: 45,
    total: 100,
  },
}

export const Full: Story = {
  args: {
    label: 'Structural',
    filled: 100,
    total: 100,
    color: 'bg-success',
  },
}

export const Empty: Story = {
  args: {
    label: 'Planning',
    filled: 0,
    total: 50,
    color: 'bg-muted-foreground/30',
  },
}

export const CustomColor: Story = {
  args: {
    label: 'History',
    filled: 75,
    total: 120,
    color: 'bg-warning',
  },
}

export const NoCounts: Story = {
  args: {
    label: 'Design',
    filled: 30,
    total: 100,
    showCounts: false,
  },
}
