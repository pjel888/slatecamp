import type { Meta, StoryObj } from '@storybook/react'
import { WikiRelatedPopover } from './WikiRelatedPopover'
import { wikiRelatedTopicsFixture } from '@/storybook/fixtures/wiki'

const meta = {
  title: 'Wiki/Sources and Notes/Wiki Related Popover',
  component: WikiRelatedPopover,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/shared/WikiRelatedPopover',
      },
    },
  },
  args: {
    topics: wikiRelatedTopicsFixture,
  },
  render: (args) => (
    <div className="w-full max-w-xs rounded-md border border-border bg-white p-5">
      <WikiRelatedPopover {...args} />
    </div>
  ),
} satisfies Meta<typeof WikiRelatedPopover>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
