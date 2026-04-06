import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumbs } from '@/components/developer/Breadcrumbs'

const meta = {
  title: 'Scenes/Developer/Breadcrumb Trail',
  component: Breadcrumbs,
  parameters: {
    layout: 'padded',
    appShell: {
      pathname: '/developer/status/database',
    },
    docs: {
      description: {
        component:
          'Reference scene for the Storybook router and provider support layer. Uses the mocked Next navigation runtime rather than importing an app page.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumbs>

export default meta

type Story = StoryObj<typeof meta>

export const DatabaseStatus: Story = {
  render: () => (
    <div className="w-[720px] rounded-md border border-border bg-card p-6">
      <Breadcrumbs />
    </div>
  ),
}
