import type { Meta, StoryObj } from '@storybook/react'
import { ZoneContextCard } from './ZoneContextCard'

const meta = {
  title: 'Score/ZoneContextCard',
  component: ZoneContextCard,
  tags: ['autodocs'],
  argTypes: {
    zone: {
      control: 'select',
      options: ['strong', 'green', 'amber', 'needs-review'],
    },
  },
} satisfies Meta<typeof ZoneContextCard>

export default meta
type Story = StoryObj<typeof meta>

export const Strong: Story = {
  args: {
    zone: 'strong',
    topicCount: 5,
  },
}

export const SolidGround: Story = {
  args: {
    zone: 'green',
    topicCount: 12,
  },
}

export const Building: Story = {
  args: {
    zone: 'amber',
    topicCount: 8,
  },
}

export const RoomToGrow: Story = {
  args: {
    zone: 'needs-review',
    topicCount: 15,
  },
}

export const WithoutTopicCount: Story = {
  args: {
    zone: 'green',
  },
}
