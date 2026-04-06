import type { Meta, StoryObj } from '@storybook/react'
import { DimensionDrill } from './DimensionDrill'

const meta = {
  title: 'Wiki/Widgets/DSGN013/Dimension Drill',
  component: DimensionDrill,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/widgets/dsgn013/DimensionDrill',
      },
    },
  },
} satisfies Meta<typeof DimensionDrill>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
