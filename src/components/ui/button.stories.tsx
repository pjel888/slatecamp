import type { Meta, StoryObj } from '@storybook/react'
import { ArrowRight, FloppyDisk, Trash } from '@phosphor-icons/react/dist/ssr'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/ui/button',
      },
    },
  },
  args: {
    children: 'Save changes',
    variant: 'default',
    size: 'default',
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const WithIcons: Story = {
  args: {
    children: 'Save article',
    leftIcon: <FloppyDisk />,
    rightIcon: <ArrowRight />,
  },
}

export const Loading: Story = {
  args: {
    children: 'Publishing',
    loading: true,
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="success">Success</Button>
      <Button variant="destructive" leftIcon={<Trash />}>
        Delete
      </Button>
      <Button variant="link">View reference</Button>
    </div>
  ),
}
