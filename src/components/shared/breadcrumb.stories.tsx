import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumb } from './breadcrumb'

const meta = {
  title: 'Shared/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  args: {
    items: [],
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/shared/breadcrumb',
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Developer', href: '/developer' },
        { label: 'Status', href: '/developer/status' },
        { label: 'Database' },
      ]}
    />
  ),
}

export const TruncatedPath: Story = {
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
