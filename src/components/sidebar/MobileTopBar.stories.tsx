import type { Meta, StoryObj } from '@storybook/react'

import { MobileTopBar } from './MobileTopBar'

const meta = {
  title: 'Sidebar/MobileTopBar',
  component: MobileTopBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        component:
          'Mobile dashboard top bar. The hamburger control uses the shared Button icon primitive.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className='min-h-[120px] bg-canvas pt-[42px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MobileTopBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onOpenDrawer: () => {},
  },
}
