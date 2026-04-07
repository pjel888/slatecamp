import type { Meta, StoryObj } from '@storybook/react'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './select'

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  args: { children: null },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Choose subject..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pd1096">PD 1096</SelectItem>
        <SelectItem value="ra9266">RA 9266</SelectItem>
        <SelectItem value="siteplanning">Site Planning</SelectItem>
        <SelectItem value="anthro">Anthropometrics</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Disabled..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Option A</SelectItem>
      </SelectContent>
    </Select>
  ),
}
