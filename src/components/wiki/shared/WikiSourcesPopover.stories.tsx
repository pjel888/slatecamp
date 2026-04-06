import type { Meta, StoryObj } from '@storybook/react'
import { WikiSourcesPopover } from './WikiSourcesPopover'
import { wikiSourcesFixture } from '@/storybook/fixtures/wiki'

const meta = {
  title: 'Wiki/Sources and Notes/Wiki Sources Popover',
  component: WikiSourcesPopover,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/shared/WikiSourcesPopover',
      },
    },
  },
  args: {
    sources: wikiSourcesFixture,
  },
  render: (args) => (
    <div className="w-full max-w-xs rounded-md border border-border bg-white p-5">
      <WikiSourcesPopover {...args} />
    </div>
  ),
} satisfies Meta<typeof WikiSourcesPopover>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
