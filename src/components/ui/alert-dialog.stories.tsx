import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'UI/alert-dialog',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: $importPath',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <div className="max-w-md rounded-md border border-border bg-card p-4 text-sm text-foreground shadow-sm">
      <p className="font-semibold">alert-dialog</p>
      <p className="mt-1 text-muted-foreground">
        Story scaffold for <code>@/components/ui/alert-dialog</code>.
      </p>
    </div>
  ),
}
