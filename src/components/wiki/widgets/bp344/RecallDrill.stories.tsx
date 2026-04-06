import type { Meta, StoryObj } from '@storybook/react'
import { RecallDrill } from './RecallDrill'

const meta = {
  title: 'Wiki/Widgets/BP344/Recall Drill',
  component: RecallDrill,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/widgets/bp344/RecallDrill',
      },
    },
  },
} satisfies Meta<typeof RecallDrill>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
