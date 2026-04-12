import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AppDrawer } from './app-drawer'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'Shared/AppDrawer',
  component: AppDrawer,
  parameters: {
    layout: 'fullscreen',
  },
  // We need a wrapper to trigger it
  render: (args) => {
    const [open, setOpen] = React.useState(args.open)
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open Drawer</Button>
        <AppDrawer {...args} open={open} onClose={() => setOpen(false)} />
      </div>
    )
  },
} satisfies Meta<typeof AppDrawer>

export default meta
type Story = StoryObj<typeof meta>

export const Right: Story = {
  args: {
    open: false,
    onClose: () => {},
    title: 'Notification Settings',
    subtitle: 'Manage how you receive alerts',
    side: 'right',
    children: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This is the default right-side drawer. It is ideal for settings, details, or secondary actions.
        </p>
        <div className="h-64 bg-muted/20 rounded border border-dashed flex items-center justify-center">
          Content Area
        </div>
      </div>
    ),
    footer: <Button className="w-full">Save Changes</Button>,
  },
}

export const Left: Story = {
  args: {
    ...Right.args,
    side: 'left',
    title: 'Navigation Menu',
  },
}

export const Bottom: Story = {
  args: {
    ...Right.args,
    side: 'bottom',
    title: 'Quick Actions',
  },
}

export const Large: Story = {
  args: {
    ...Right.args,
    size: 'lg',
    title: 'Advanced Filtering',
  },
}
