import type { Meta, StoryObj } from '@storybook/react'
import { StatusBanner } from './StatusBanner'

const meta = {
  title: 'Developer/StatusBanner',
  component: StatusBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/developer/StatusBanner',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[720px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusBanner>

export default meta

type Story = StoryObj<typeof meta>

export const MixedStatus: Story = {
  args: {
    checkedAtLabel: '10:42 AM',
    statuses: [
      { service: 'Database', status: 'operational' },
      { service: 'Search', status: 'degraded' },
      { service: 'Queue', status: 'operational' },
    ],
  },
}
