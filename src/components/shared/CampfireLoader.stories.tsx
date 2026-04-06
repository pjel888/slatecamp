import type { Meta, StoryObj } from '@storybook/react'
import { CampfireLoader } from './CampfireLoader'

const meta = {
  title: 'Shared/CampfireLoader',
  component: CampfireLoader,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/shared/CampfireLoader',
      },
    },
  },
} satisfies Meta<typeof CampfireLoader>

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
