import type { Meta, StoryObj } from '@storybook/react'
import { DashboardPageSkeleton } from './DashboardPageSkeleton'

const meta = {
  title: 'Shared/DashboardPageSkeleton',
  component: DashboardPageSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Source: @/components/shared/DashboardPageSkeleton',
      },
    },
  },
} satisfies Meta<typeof DashboardPageSkeleton>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {}
