import type { Meta, StoryObj } from '@storybook/react'
import { StatusBadge } from './StatusBadge'

const meta = {
  title: 'Developer/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Source: @/components/developer/StatusBadge',
      },
    },
  },
} satisfies Meta<typeof StatusBadge>

export default meta

type Story = StoryObj<typeof meta>

export const Operational: Story = {
  args: {
    status: 'operational',
  },
}

export const Degraded: Story = {
  args: {
    status: 'degraded',
  },
}

export const Outage: Story = {
  args: {
    status: 'outage',
  },
}
