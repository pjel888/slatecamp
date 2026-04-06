import type { Meta, StoryObj } from '@storybook/react'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import { Button } from '@/components/ui/button'
import { EmptyState } from './empty-state'

const meta = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/shared/empty-state',
      },
    },
  },
} satisfies Meta<typeof EmptyState>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  args: {
    icon: <MagnifyingGlass size={20} />,
    title: 'No wiki results yet',
    description: 'Try a shorter query or widen the subject scope before creating a new article.',
  },
}

export const WithAction: Story = {
  args: {
    icon: <MagnifyingGlass size={20} />,
    title: 'No matching citations',
    description: 'This article still needs at least one published source before it can move to review.',
    action: <Button size="sm">Add source</Button>,
  },
}
