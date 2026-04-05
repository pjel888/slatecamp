import type { Meta, StoryObj } from '@storybook/react'
import { CopyButton } from './CopyButton'

const meta = {
  title: 'Portal/CopyButton',
  component: CopyButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Source: @/components/portal/CopyButton',
      },
    },
  },
  args: {
    text: "import { PortalLayout } from '@/components/portal'",
  },
} satisfies Meta<typeof CopyButton>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {}
