import type { Meta, StoryObj } from '@storybook/react'
import { Spinner } from './spinner'

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Spinner className="h-6 w-6 text-primary" />,
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="h-4 w-4 text-primary" />
      <Spinner className="h-6 w-6 text-primary" />
      <Spinner className="h-8 w-8 text-primary" />
      <Spinner className="h-10 w-10 text-primary" />
    </div>
  ),
}

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="h-6 w-6 text-primary" />
      <Spinner className="h-6 w-6 text-success" />
      <Spinner className="h-6 w-6 text-warning" />
      <Spinner className="h-6 w-6 text-destructive" />
      <Spinner className="h-6 w-6 text-muted-foreground" />
    </div>
  ),
}
