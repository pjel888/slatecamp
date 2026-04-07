import type { Meta, StoryObj } from '@storybook/react'
import { House, Folder, File } from '@phosphor-icons/react/dist/ssr'
import { Breadcrumb } from './breadcrumb'

const meta = {
  title: 'UI/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  args: {
    items: [],
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Navigation breadcrumb with auto-truncation. Source: @/components/ui/breadcrumb',
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Wiki', href: '/dashboard/wiki' },
        { label: 'PD 1096' },
      ]}
    />
  ),
}

export const WithIcons: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Home', href: '/', icon: <House className="h-3.5 w-3.5" /> },
        { label: 'Documents', href: '/docs', icon: <Folder className="h-3.5 w-3.5" /> },
        { label: 'Report.pdf', icon: <File className="h-3.5 w-3.5" /> },
      ]}
    />
  ),
}

export const SlashSeparator: Story = {
  render: () => (
    <Breadcrumb
      separator="slash"
      items={[
        { label: 'Developer', href: '/developer' },
        { label: 'Status', href: '/developer/status' },
        { label: 'Database' },
      ]}
    />
  ),
}

export const Collapsed: Story = {
  name: 'Collapsed (Ellipsis)',
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Wiki', href: '/dashboard/wiki' },
        { label: 'Design Systems', href: '/dashboard/wiki/design-systems' },
        { label: 'Storybook', href: '/dashboard/wiki/design-systems/storybook' },
        { label: 'Migration Checklist' },
      ]}
    />
  ),
}

export const DarkMode: Story = {
  name: 'Dark Mode Grid',
  render: () => (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Drills', href: '/dashboard/drills' },
          { label: 'PD 1096 Quiz' },
        ]}
      />
      <Breadcrumb
        separator="slash"
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Settings' },
        ]}
      />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/', icon: <House className="h-3.5 w-3.5" /> },
          { label: 'Documents', href: '/docs', icon: <Folder className="h-3.5 w-3.5" /> },
          { label: 'Report.pdf', icon: <File className="h-3.5 w-3.5" /> },
        ]}
      />
    </div>
  ),
}
