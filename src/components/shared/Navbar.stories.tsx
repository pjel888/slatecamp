import type { Meta, StoryObj } from '@storybook/react'
import { Navbar } from './Navbar'

const meta = {
  title: 'Shared/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background">
        <Story />
        <div className="p-4 text-sm text-muted-foreground">
          Note: This navbar is only visible on mobile/tablet viewports (hidden on lg:).
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Navbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Admin: Story = {
  args: {
    isAdmin: true,
  },
}
