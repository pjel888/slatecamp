import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from './separator'

const meta = {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/ui/separator',
      },
    },
  },
} satisfies Meta<typeof Separator>

export default meta

type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="w-[420px] space-y-3">
      <div className="text-sm font-medium text-foreground">Article metadata</div>
      <Separator />
      <div className="text-sm text-muted-foreground">
        Use horizontal separators to separate related content blocks without introducing another card.
      </div>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-12 items-center gap-4">
      <span className="text-sm text-foreground">Draft</span>
      <Separator orientation="vertical" />
      <span className="text-sm text-foreground">Review</span>
      <Separator orientation="vertical" />
      <span className="text-sm text-foreground">Publish</span>
    </div>
  ),
}
