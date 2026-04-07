import type { Meta, StoryObj } from '@storybook/react'
import { SlatecampLoader } from './SlatecampLoader'

const meta = {
  title: 'Shared/SlatecampLoader',
  component: SlatecampLoader,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/shared/SlatecampLoader',
      },
    },
  },
} satisfies Meta<typeof SlatecampLoader>

export default meta

type Story = StoryObj<typeof meta>

export const StaticMessage: Story = {
  args: {
    staticMessage: 'Preparing the article workspace...',
    className: 'min-h-[220px] w-[360px]',
  },
}

export const RotatingMessages: Story = {
  args: {
    className: 'min-h-[220px] w-[360px]',
    interval: 1200,
  },
}
