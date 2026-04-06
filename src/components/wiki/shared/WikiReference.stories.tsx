import type { Meta, StoryObj } from '@storybook/react'
import { WikiReference } from './WikiReference'

const meta = {
  title: 'Wiki/Sources and Notes/Wiki Reference',
  component: WikiReference,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    appShell: {
      pathname: '/dashboard/wiki/fire-separation-occupancy-exit-strategy',
    },
    docs: {
      description: {
        component: 'Source: @/components/wiki/shared/WikiReference',
      },
    },
  },
  args: {
    slug: 'means-of-egress-basics',
    children: 'Means of egress basics',
  },
  render: (args) => (
    <div className="max-w-2xl rounded-md border border-border bg-white p-6 text-sm leading-7 text-text-secondary">
      Start with occupant load, then jump to <WikiReference {...args} /> if you need the baseline exit-count framework before applying exceptions.
    </div>
  ),
} satisfies Meta<typeof WikiReference>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
