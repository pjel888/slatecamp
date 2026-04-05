import type { Meta, StoryObj } from '@storybook/react'
import { StatusKPICard } from './StatusKPICard'

const meta = {
  title: 'Developer/StatusKPICard',
  component: StatusKPICard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Source: @/components/developer/StatusKPICard',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-60">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusKPICard>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  args: {
    label: 'API latency',
    value: 182,
    unit: 'ms',
    status: 'operational',
  },
}
