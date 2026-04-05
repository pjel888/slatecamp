import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'UI/input',
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
      <p className="font-semibold">input</p>
      <p className="mt-1 text-muted-foreground">
        Story scaffold for <code>@/components/ui/input</code>.
      </p>
    </div>
  ),
}
