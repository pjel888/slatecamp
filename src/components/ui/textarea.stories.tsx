import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Textarea className="w-[320px]" placeholder="Write your notes..." />,
}

export const WithCharacterCount: Story = {
  render: () => <Textarea className="w-[320px]" placeholder="Max 200 chars..." maxLength={200} />,
}

export const Disabled: Story = {
  render: () => <Textarea className="w-[320px]" disabled value="Read-only content" />,
}
