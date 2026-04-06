import type { Meta, StoryObj } from '@storybook/react'
import { SpatialQualityDrill } from './SpatialQualityDrill'

const meta = {
  title: 'Wiki/Widgets/DSGN013/Spatial Quality Drill',
  component: SpatialQualityDrill,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/widgets/dsgn013/SpatialQualityDrill',
      },
    },
  },
} satisfies Meta<typeof SpatialQualityDrill>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
