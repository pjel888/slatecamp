import type { Meta, StoryObj } from '@storybook/react'
import { BodyDimensionDrill } from './BodyDimensionDrill'

const meta = {
  title: 'Wiki/Widgets/DSGN013/Body Dimension Drill',
  component: BodyDimensionDrill,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/widgets/dsgn013/BodyDimensionDrill',
      },
    },
  },
} satisfies Meta<typeof BodyDimensionDrill>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
