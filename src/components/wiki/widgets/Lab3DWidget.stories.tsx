import type { Meta, StoryObj } from '@storybook/react'
import Lab3DWidget from './Lab3DWidget'

const meta = {
  title: 'Wiki/Widgets/Integrations/Lab 3D Widget',
  component: Lab3DWidget,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Source: @/components/wiki/widgets/Lab3DWidget',
      },
    },
  },
  args: {
    moduleId: 'accessible-door-clearances',
    caption: 'Embedded 3D lab modules let the article call a focused compliance scene.',
  },
} satisfies Meta<typeof Lab3DWidget>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const MissingModule: Story = {
  args: {
    moduleId: 'missing-module',
  },
}
