import type { Meta, StoryObj } from '@storybook/react'
import { UserAvatar } from './user-avatar'

const meta = {
  title: 'Shared/UserAvatar',
  component: UserAvatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
  },
} satisfies Meta<typeof UserAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const WithImage: Story = {
  args: {
    displayName: 'Philip Lewis',
    avatarUrl: 'https://github.com/shadcn.png',
  },
}

export const Fallback: Story = {
  args: {
    displayName: 'Philip Lewis',
  },
}

export const Small: Story = {
  args: {
    displayName: 'Philip Lewis',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    displayName: 'Philip Lewis',
    size: 'lg',
  },
}

export const NoName: Story = {
  args: {
    displayName: null,
  },
}
