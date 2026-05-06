import type { Meta, StoryObj } from '@storybook/react'

import { MobileDrawer } from './MobileDrawer'

const meta = {
  title: 'Sidebar/MobileDrawer',
  component: MobileDrawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        component:
          'Mobile dashboard navigation drawer. Header close control uses the shared Button icon primitive.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className='min-h-screen bg-canvas'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MobileDrawer>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    userDisplay: {
      name: 'Philip Lewis',
      avatarUrl: null,
    },
    tierLabel: 'Pro',
    showTierBadge: true,
  },
}

export const Closed: Story = {
  args: {
    ...Open.args,
    isOpen: false,
  },
}
