import type { Meta, StoryObj } from '@storybook/react'
import { Switch } from './switch'

const meta = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="s1" />
      <label htmlFor="s1" className="text-sm">Notifications</label>
    </div>
  ),
}

export const Checked: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="s2" defaultChecked />
      <label htmlFor="s2" className="text-sm">Dark mode</label>
    </div>
  ),
}

export const Small: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="s3" size="sm" />
      <label htmlFor="s3" className="text-xs">Compact switch</label>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Switch id="s4" disabled />
        <label htmlFor="s4" className="text-sm text-muted-foreground">Disabled off</label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="s5" disabled defaultChecked />
        <label htmlFor="s5" className="text-sm text-muted-foreground">Disabled on</label>
      </div>
    </div>
  ),
}
