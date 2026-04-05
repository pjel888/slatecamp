import type { Meta, StoryObj } from '@storybook/react'
import { PreviewArea } from './PreviewArea'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'Developer/PreviewArea',
  component: PreviewArea,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/developer/PreviewArea',
      },
    },
  },
} satisfies Meta<typeof PreviewArea>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  args: {
    children: 'Preview Content',
  },
  render: (args) => (
    <div className="w-[680px]">
      <PreviewArea {...args}>
        <Button>Preview Content</Button>
      </PreviewArea>
    </div>
  ),
}
