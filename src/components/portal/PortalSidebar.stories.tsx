import type { Meta, StoryObj } from '@storybook/react'
import { BookOpen, Code, Gear, House } from '@phosphor-icons/react/dist/ssr'

import { SidebarProvider } from '@/components/sidebar/SidebarProvider'
import { PortalSidebar } from './PortalSidebar'

const navItems = [
  {
    label: 'Documentation',
    items: [
      { label: 'Overview', href: '/developer', icon: <House /> },
      {
        label: 'API Reference',
        href: '/developer/api-reference',
        icon: <Code />,
        children: [
          { label: 'Authentication', href: '/developer/api-reference/authentication' },
          { label: 'Webhooks', href: '/developer/api-reference/webhooks' },
        ],
      },
      { label: 'Guides', href: '/developer/guides', icon: <BookOpen />, badge: 3 },
    ],
  },
  {
    label: 'Manage',
    items: [
      { label: 'Settings', href: '/developer/settings', icon: <Gear /> },
    ],
  },
]

const meta = {
  title: 'Portal/PortalSidebar',
  component: PortalSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <SidebarProvider disableShortcuts>
        <div className='min-h-screen min-w-[1024px] bg-background'>
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
  args: {
    navItems,
    accentColor: '#2563eb',
    accentLightColor: 'rgba(37, 99, 235, 0.08)',
  },
} satisfies Meta<typeof PortalSidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Filtered: Story = {
  play: async ({ canvasElement }) => {
    const input = canvasElement.ownerDocument.querySelector<HTMLInputElement>(
      'input[aria-label="Filter portal navigation"]',
    )
    if (!input) return
    input.focus()
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set
    nativeInputValueSetter?.call(input, 'auth')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  },
}
